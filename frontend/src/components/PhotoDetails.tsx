import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout, Typography, Spin, Image, Button, Breadcrumb } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getPhotoById, getUploadsUrl } from "../api";
import type { PhotoType } from "../types";
import { colors } from "../theme/colors";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export const PhotoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadPhoto = async () => {
      try {
        const data = await getPhotoById(Number(id));
        setPhoto(data);
      } catch (err) {
        setError("Фотография не найдена");
      } finally {
        setLoading(false);
      }
    };
    loadPhoto();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Title level={3} type="danger">{error || "Фотография не найдена"}</Title>
        <Link to="/gallery">
          <Button icon={<ArrowLeftOutlined />}>Вернуться в галерею</Button>
        </Link>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: colors.background }}>
      <Content style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <Breadcrumb style={{ marginBottom: "1.5rem" }}>
          <Breadcrumb.Item><Link to="/">Главная</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/gallery">Галерея</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{photo.title}</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: "2rem" }}>
          <Image
            src={getUploadsUrl(photo.filename)}
            alt={photo.title}
            style={{ width: "100%", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          />
        </div>

        <Title level={1}>{photo.title}</Title>
        
        <div style={{ marginTop: "2rem" }}>
          <Title level={4}>Описание</Title>
          <Paragraph style={{ fontSize: "1.1rem", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
            {photo.fullDescription || photo.description || "Описание отсутствует"}
          </Paragraph>
        </div>

        <div style={{ marginTop: "3rem", borderTop: `1px solid ${colors.border}`, paddingTop: "1rem" }}>
          <Text type="secondary">Автор: {photo.user?.username || "Неизвестен"}</Text>
          <br />
          <Text type="secondary">Дата: {new Date(photo.createdAt).toLocaleDateString()}</Text>
        </div>
      </Content>
    </Layout>
  );
};
