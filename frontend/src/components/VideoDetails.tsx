import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout, Typography, Spin, Button, Breadcrumb } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getVideoById, getVideosUrl } from "../api";
import type { VideoType } from "../types";
import { colors } from "../theme/colors";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export const VideoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadVideo = async () => {
      try {
        const data = await getVideoById(Number(id));
        setVideo(data);
      } catch {
        setError("Видео не найдено");
      } finally {
        setLoading(false);
      }
    };
    loadVideo();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Title level={3} type="danger">{error || "Видео не найдено"}</Title>
        <Link to="/videos">
          <Button icon={<ArrowLeftOutlined />}>Вернуться к списку видео</Button>
        </Link>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: colors.background }}>
      <Content style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <Breadcrumb style={{ marginBottom: "1.5rem" }}>
          <Breadcrumb.Item><Link to="/">Главная</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/videos">Видео</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{video.title}</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: "2rem", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <video
            src={getVideosUrl(video.filename)}
            controls
            style={{ width: "100%", display: "block" }}
            preload="metadata"
            playsInline
          />
        </div>

        <Title level={1} style={{ color: colors.primary, fontWeight: 600 }}>{video.title}</Title>

        <div style={{ marginTop: "2rem" }}>
          <Title level={4} style={{ color: colors.primary }}>Описание</Title>
          <Paragraph style={{ fontSize: "1.1rem", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
            {video.fullDescription || video.description || "Описание отсутствует"}
          </Paragraph>
        </div>

        <div style={{ marginTop: "3rem", borderTop: `1px solid ${colors.border}`, paddingTop: "1rem" }}>
          <Text style={{ color: colors.textSecondary }}>Автор: {video.user?.username || "Неизвестен"}</Text>
          <br />
          <Text style={{ color: colors.textSecondary }}>Дата: {new Date(video.createdAt).toLocaleDateString()}</Text>
        </div>
      </Content>
    </Layout>
  );
};
