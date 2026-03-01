import { Card, Col, Empty, Layout, Row, Spin, Typography, Tooltip, Button } from "antd";
import { PlayCircleOutlined, InfoCircleOutlined, DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchVideos, type VideosState } from "../store/videosSlice";
import { getVideosUrl } from "../api";
import { colors } from "../theme/colors";

const { Content } = Layout;
const { Text } = Typography;
const VIDEOS_PAGE_SIZE = 50;

export function VideoGallery() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: videos, total, loading, loadingMore, error } = useAppSelector((s) => s.videos) as VideosState;
  const hasMore = total > VIDEOS_PAGE_SIZE && videos.length < total;

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
          КОЦ «Оккервиль»
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

        {!loading && videos.length === 0 && !error && (
          <Empty description="Пока нет видео" style={{ padding: "3rem" }} />
        )}

        {!loading && videos.length > 0 && (
          <>
            <Row gutter={[24, 24]}>
              {videos.map((video) => (
                <Col xs={24} sm={12} md={8} lg={8} key={video.id}>
                  <Card
                    hoverable
                    style={{ background: colors.background, border: `1px solid ${colors.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                    cover={
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "16/9",
                          overflow: "hidden",
                          background: colors.backgroundLight,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(`/video/${video.id}`)}
                      >
                        <video
                          src={getVideosUrl(video.filename)}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          preload="metadata"
                          muted
                          playsInline
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.2)",
                          }}
                        >
                          <PlayCircleOutlined style={{ fontSize: 48, color: "#fff" }} />
                        </div>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>{video.title}</span>
                          <Tooltip title="Открыть страницу видео">
                            <InfoCircleOutlined
                              style={{ color: colors.primary, cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/video/${video.id}`);
                              }}
                            />
                          </Tooltip>
                        </div>
                      }
                      description={video.description}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            {hasMore && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <Button
                  type="primary"
                  icon={<DownOutlined />}
                  loading={loadingMore}
                  onClick={() => dispatch(fetchVideos({ offset: videos.length, limit: VIDEOS_PAGE_SIZE }))}
                >
                  Загрузить ещё ({videos.length} из {total})
                </Button>
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
}
