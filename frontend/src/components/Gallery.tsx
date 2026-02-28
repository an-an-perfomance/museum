import { Button, Card, Col, Empty, Form, Image, Input, Layout, Modal, Row, Spin, Typography, Upload, message, Tooltip } from "antd";
import { PlusOutlined, UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPhotos } from "../store/photosSlice";
import { uploadPhoto } from "../api";

const { Content } = Layout;
const { Text } = Typography;

export function Gallery() {
  const dispatch = useAppDispatch();
  const { items: photos, loading, error } = useAppSelector((s) => s.photos);
  const { user } = useAppSelector((s) => s.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (values: { title: string; description?: string; fullDescription?: string }) => {
    if (fileList.length === 0) {
      message.error("Пожалуйста, выберите фото");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.description) {
      formData.append("description", values.description);
    }
    if (values.fullDescription) {
      formData.append("fullDescription", values.fullDescription);
    }
    formData.append("photo", fileList[0].originFileObj);
    try {
      await uploadPhoto(formData);
      message.success("Фото успешно добавлено");
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      dispatch(fetchPhotos());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "inherit",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 1.5rem",
        }}
      >
        <Link to="/" style={{ fontSize: "1.25rem", fontWeight: 500, color: "inherit" }}>
          Музей школы
        </Link>
        {user && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Добавить фото
          </Button>
        )}
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
          <Image.PreviewGroup>
            <Row gutter={[24, 24]}>
              {photos.map((photo) => (
                <Col xs={24} sm={12} md={8} lg={8} key={photo.id}>                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          aspectRatio: "4/3",
                          overflow: "hidden",
                          background: "#fafafa",
                        }}
                      >
                        <Image
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
                    <Card.Meta 
                      title={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>{photo.title}</span>
                          <Tooltip title="Открыть полное описание фото">
                            <InfoCircleOutlined 
                              style={{ color: "#1890ff", cursor: "pointer" }} 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/#/photo/${photo.id}`, "_blank");
                              }}
                            />
                          </Tooltip>
                        </div>
                      } 
                      description={photo.description}
                    />
                  </Card>                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        )}
      </Content>

      <Modal
        title="Добавить фотографию"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input placeholder="Введите название фотографии" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea placeholder="Введите краткое описание фотографии" rows={2} />
          </Form.Item>

          <Form.Item
            name="fullDescription"
            label="Полное описание"
          >
            <Input.TextArea placeholder="Введите полное описание фотографии" rows={5} />
          </Form.Item>
          <Form.Item
            label="Фотография"
            required
            extra="Поддерживаются форматы JPG, PNG"
          >
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Выбрать файл</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
                setFileList([]);
              }}
            >
              Отмена
            </Button>
            <Button type="primary" htmlType="submit" loading={uploading}>
              Загрузить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
