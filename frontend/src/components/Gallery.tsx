import { Card, Col, Empty, Layout, Row, Spin, Typography } from "antd";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const { Content } = Layout;
const { Text } = Typography;

export function Gallery() {
  const { items: photos, loading, error } = useAppSelector((s) => s.photos);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "inherit",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 1.5rem",
        }}
      >
        <Link to="/" style={{ fontSize: "1.25rem", fontWeight: 500, color: "inherit" }}>
          Музей школы
        </Link>
      </Layout.Header>

      <Content style={{ padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
        {loading && (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        )}

        {error && (
          <Text type="danger" style={{ display: "block", marginBottom: "1rem" }}>
            {error}
          </Text>
        )}

        {!loading && photos.length === 0 && !error && (
          <Empty description="Пока нет фотографий" style={{ padding: "3rem" }} />
        )}

        {!loading && photos.length > 0 && (
          <Row gutter={[16, 16]}>
            {photos.map((photo) => (
              <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        background: "#fafafa",
                      }}
                    >
                      <img
                        alt={photo.title}
                        src={`http://localhost:5000/uploads/${photo.filename}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    </div>
                  }
                >
                  <Card.Meta title={photo.title} />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Content>
    </Layout>
  );
}
