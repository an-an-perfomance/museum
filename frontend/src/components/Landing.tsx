import { Carousel, Empty, Layout, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const { Content } = Layout;
const { Title, Text } = Typography;

export function Landing() {
  const navigate = useNavigate();
  const { items: photos, loading, error } = useAppSelector((s) => s.photos);

  return (
    <Layout
      style={{ minHeight: "100vh", cursor: "pointer" }}
      onClick={() => navigate("/gallery")}
    >
      <Content style={{ padding: "2rem 1rem 4rem", textAlign: "center" }}>
        <Title level={1} style={{ marginBottom: "2rem" }}>
          Музей школы
        </Title>

        {loading && (
          <div style={{ padding: "3rem" }}>
            <Spin size="large" />
          </div>
        )}

        {error && (
          <Text type="danger" style={{ display: "block", marginBottom: "1rem" }}>
            {error}
          </Text>
        )}

        {!loading && photos.length === 0 && !error && (
          <div style={{ marginBottom: "2rem" }}>
            <Empty description="Пока нет фотографий" />
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div style={{ maxWidth: 800, margin: "0 auto 2rem" }}>
            <Carousel autoplay effect="fade" dotPosition="bottom">
              {photos.map((photo) => (
                <div key={photo.id}>
                  <div
                    style={{
                      height: 400,
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`http://localhost:5000/uploads/${photo.filename}`}
                      alt={photo.title}                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        )}

        <Text type="secondary">Нажмите в любом месте, чтобы перейти в галерею</Text>
      </Content>
    </Layout>
  );
}
