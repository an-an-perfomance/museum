import { Card, Col, Empty, Image, Layout, Row, Spin, Typography, Tooltip, Button } from "antd";
import { InfoCircleOutlined, DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPhotos } from "../store/photosSlice";
import { getUploadsUrl } from "../api";
import { colors } from "../theme/colors";

const { Content } = Layout;
const { Text } = Typography;
const PHOTOS_PAGE_SIZE = 50;

export function Gallery() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: photos, total, loading, loadingMore, error } = useAppSelector((s) => s.photos);
  const hasMore = total > PHOTOS_PAGE_SIZE && photos.length < total;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "inherit",
          borderBottom: `1px solid ${colors.border}`,
          padding: "0 1.5rem",
        }}
      >
        <Link to="/" style={{ fontSize: "1.25rem", fontWeight: 500, color: colors.primary }}>
          Музей школы №323
        </Link>
        <span style={{ fontSize: "1.25rem", fontWeight: 600, color: colors.primaryRed }}>
          Оккервиль
        </span>
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
          <>
            <Image.PreviewGroup>
              <Row gutter={[24, 24]}>
                {photos.map((photo) => (
                  <Col xs={24} sm={12} md={8} lg={8} key={photo.id}>
                    <Card
                      hoverable
                      style={{ border: `1px solid ${colors.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                      cover={
                        <div
                          style={{
                            aspectRatio: "4/3",
                            overflow: "hidden",
                            background: colors.backgroundLight,
                          }}
                        >
                          <Image
                            alt={photo.title}
                            src={getUploadsUrl(photo.filename)}
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
                      <Card.Meta 
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{photo.title}</span>
                            <Tooltip title="Открыть полное описание фото">
                              <InfoCircleOutlined 
                                style={{ color: colors.primary, cursor: "pointer" }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/photo/${photo.id}`);
                                }}
                              />
                            </Tooltip>
                          </div>
                        } 
                        description={photo.description}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>
            {hasMore && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <Button
                  type="primary"
                  icon={<DownOutlined />}
                  loading={loadingMore}
                  onClick={() => dispatch(fetchPhotos({ offset: photos.length, limit: PHOTOS_PAGE_SIZE }))}
                >
                  Загрузить ещё ({photos.length} из {total})
                </Button>
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
}
