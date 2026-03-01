import React from "react";
import { Layout, Menu, Button, Typography, Space } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/authSlice";
import { colors } from "../theme/colors";
import { LogoutOutlined, UserOutlined, SettingOutlined, PictureOutlined } from "@ant-design/icons";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const menuItems = [
    {
      key: "/",
      label: <Link to="/">Главная</Link>,
    },
    {
      key: "/gallery",
      label: <Link to="/gallery">Галерея</Link>,
      icon: <PictureOutlined />,
    },
    ...(user?.role === "ADMIN"
      ? [
        {
          key: "/admin",
          label: <Link to="/admin">Админ-панель</Link>,
          icon: <SettingOutlined />,
        },
      ]
      : []),
  ];

  return (
    <AntHeader style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: colors.backgroundLight, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <div className="logo" style={{ fontWeight: "bold", fontSize: "18px", marginRight: "24px", color: colors.primary }}>
          Музей Школы
        </div>
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ flex: 1, borderBottom: "none", background: colors.backgroundLight }}
      />
    </div>

    <Space size="middle">
      {isAuthenticated ? (
        <>
          <Space>
            <UserOutlined />
            <Text strong>{user?.username}</Text>
          </Space>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </>
      ) : (
        <Button type="primary" onClick={() => navigate("/login")}>
          Войти
        </Button>
      )}
    </Space>
    </AntHeader>
  );
};
