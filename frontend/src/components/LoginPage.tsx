import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Layout } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { login } from "../api";

const { Title } = Typography;
const { Content } = Layout;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = await login(values);
      dispatch(setCredentials(data));
      message.success("Вы успешно вошли в систему");
      navigate("/");
    } catch (err) {
      message.error("Неверное имя пользователя или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2}>Вход в систему</Title>
          <Typography.Text type="secondary">Школьный музей</Typography.Text>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Введите имя пользователя" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Button type="link" onClick={() => navigate("/")}>
              Вернуться на главную
            </Button>
          </div>
        </Form>
      </Card>
    </Content>
  );
};
