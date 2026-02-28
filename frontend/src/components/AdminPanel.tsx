import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message, Popconfirm, Tabs, Image, Upload } from "antd";
import { CopyOutlined, UserAddOutlined, DeleteOutlined, KeyOutlined, EditOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { getUsers, createUser, deleteUser, resetUserPassword, fetchPhotos, deletePhotos, updatePhoto, uploadPhoto } from "../api";
import type { UserType, PhotoType } from "../types";
const { Title, Text } = Typography;

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isEditPhotoModalVisible, setIsEditPhotoModalVisible] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoType | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [form] = Form.useForm();
  const [photoForm] = Form.useForm();
  const [editPhotoForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await fetchPhotos();
      setPhotos(data);
    } catch (err) {
      message.error("Не удалось загрузить список фотографий");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPhotos();
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

  const handleAddPhoto = async (values: any) => {
    if (fileList.length === 0) {
      message.error("Пожалуйста, выберите фото");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.description) formData.append("description", values.description);
    if (values.fullDescription) formData.append("fullDescription", values.fullDescription);
    formData.append("photo", fileList[0].originFileObj);

    try {
      await uploadPhoto(formData);
      message.success("Фото успешно добавлено");
      setIsPhotoModalVisible(false);
      photoForm.resetFields();
      setFileList([]);
      loadPhotos();
    } catch (err) {
      message.error("Ошибка при загрузке фото");
    } finally {
      setUploading(false);
    }
  };

  const handleEditPhoto = async (values: any) => {
    if (!editingPhoto) return;
    try {
      await updatePhoto(editingPhoto.id, values);
      message.success("Фото обновлено");
      setIsEditPhotoModalVisible(false);
      setEditingPhoto(null);
      loadPhotos();
    } catch (err) {
      message.error("Ошибка при обновлении фото");
    }
  };

  const handleDeletePhoto = async (id: number) => {
    try {
      await deletePhotos([id]);
      message.success("Фото удалено");
      loadPhotos();
    } catch (err) {
      message.error("Ошибка при удалении фото");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    message.success("Пароль скопирован в буфер обмена");
  };

  const userColumns = [
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

  const photoColumns = [
    { 
      title: "Превью", 
      key: "preview",
      render: (_: any, record: PhotoType) => (
        <Image
          width={50}
          src={`http://localhost:5000/uploads/${record.filename}`}
          fallback="https://via.placeholder.com/50"
        />
      )
    },
    { title: "Название", dataIndex: "title", key: "title" },
    { title: "Описание", dataIndex: "description", key: "description", ellipsis: true },
    { title: "Автор", key: "author", render: (_: any, record: any) => record.user?.username },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: PhotoType) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingPhoto(record);
              editPhotoForm.setFieldsValue({
                title: record.title,
                description: record.description,
                fullDescription: record.fullDescription
              });
              setIsEditPhotoModalVisible(true);
            }}
          />
          <Popconfirm
            title="Удалить это фото?"
            onConfirm={() => handleDeletePhoto(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: 'users',
      label: 'Пользователи',
      children: (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <Title level={4}>Управление пользователями</Title>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Добавить пользователя
            </Button>
          </div>
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            loading={loading}
          />
        </>
      ),
    },
    {
      key: 'photos',
      label: 'Фотографии',
      children: (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <Title level={4}>Управление фотографиями</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsPhotoModalVisible(true)}
            >
              Добавить фото
            </Button>
          </div>
          <Table
            columns={photoColumns}
            dataSource={photos}
            rowKey="id"
            loading={loading}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Панель администратора</Title>
      
      <Tabs defaultActiveKey="users" items={items} />

      {/* Модалка добавления пользователя */}
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

      {/* Модалка добавления фото */}
      <Modal
        title="Добавить фотографию"
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        onOk={() => photoForm.submit()}
        confirmLoading={uploading}
      >
        <Form form={photoForm} layout="vertical" onFinish={handleAddPhoto}>
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="fullDescription" label="Полное описание">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="Файл" required>
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Выбрать файл</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка редактирования фото */}
      <Modal
        title="Редактировать фото"
        open={isEditPhotoModalVisible}
        onCancel={() => setIsEditPhotoModalVisible(false)}
        onOk={() => editPhotoForm.submit()}
      >
        <Form form={editPhotoForm} layout="vertical" onFinish={handleEditPhoto}>
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="fullDescription" label="Полное описание">
            <Input.TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
