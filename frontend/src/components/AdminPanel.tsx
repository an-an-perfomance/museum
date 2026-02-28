import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message, Popconfirm } from "antd";
import { CopyOutlined, UserAddOutlined, DeleteOutlined, KeyOutlined } from "@ant-design/icons";
import { getUsers, createUser, deleteUser, resetUserPassword } from "../api";
import type { UserType } from "../types";
const { Title, Text } = Typography;

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [form] = Form.useForm();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      message.error("Не удалось загрузить список пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (values: any) => {
    try {
      await createUser(values);
      message.success("Пользователь успешно создан");
      setIsAddModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (err) {
      message.error("Ошибка при создании пользователя");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      message.success("Пользователь удален");
      loadUsers();
    } catch (err) {
      message.error("Ошибка при удалении пользователя");
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const { newPassword } = await resetUserPassword(id);
      setGeneratedPassword(newPassword);
      setIsResetModalVisible(true);
    } catch (err) {
      message.error("Ошибка при сбросе пароля");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    message.success("Пароль скопирован в буфер обмена");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Имя пользователя", dataIndex: "username", key: "username" },
    { title: "Роль", dataIndex: "role", key: "role" },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: UserType) => (
        <Space size="middle">
          <Button
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record.id)}
          >
            Сбросить пароль
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить этого пользователя?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <Title level={2}>Управление пользователями</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Добавить пользователя
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />

      {/* Модалка добавления */}
      <Modal
        title="Добавить нового пользователя"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAddUser} layout="vertical">
          <Form.Item
            name="username"
            label="Имя пользователя"
            rules={[{ required: true, message: "Введите имя пользователя" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Роль"
            initialValue="USER"
          >
            <Select>
              <Select.Option value="USER">Пользователь</Select.Option>
              <Select.Option value="ADMIN">Администратор</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка сброса пароля */}
      <Modal
        title="Пароль успешно сброшен"
        open={isResetModalVisible}
        onCancel={() => setIsResetModalVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={copyToClipboard}>
            Скопировать
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsResetModalVisible(false)}>
            Закрыть
          </Button>,
        ]}
      >
        <Text>Новый пароль для пользователя:</Text>
        <div style={{ marginTop: "10px", padding: "10px", background: "#f5f5f5", borderRadius: "4px", textAlign: "center" }}>
          <Text strong style={{ fontSize: "18px" }}>{generatedPassword}</Text>
        </div>
      </Modal>
    </div>
  );
};
