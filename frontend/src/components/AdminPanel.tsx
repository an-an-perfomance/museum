import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message, Popconfirm, Tabs, Image, Upload } from "antd";
import { CopyOutlined, UserAddOutlined, DeleteOutlined, KeyOutlined, EditOutlined, PlusOutlined, UploadOutlined, DownOutlined } from "@ant-design/icons";
import { getUsers, createUser, deleteUser, resetUserPassword, deletePhotos, updatePhoto, uploadPhoto, getUploadsUrl, deleteVideos, updateVideo, uploadVideo, getVideosUrl } from "../api";
import type { UserType, PhotoType, VideoType } from "../types";
import { colors } from "../theme/colors";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPhotos } from "../store/photosSlice";
import { fetchVideos } from "../store/videosSlice";
const { Title, Text } = Typography;
const PHOTOS_PAGE_SIZE = 50;
const VIDEOS_PAGE_SIZE = 50;

export const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: photos, total: photosTotal, loading: photosLoading, loadingMore: photosLoadingMore } = useAppSelector((s) => s.photos);
  const { items: videos, total: videosTotal, loading: videosLoading, loadingMore: videosLoadingMore } = useAppSelector((s) => s.videos);
  const hasMorePhotos = photosTotal > PHOTOS_PAGE_SIZE && photos.length < photosTotal;
  const hasMoreVideos = videosTotal > VIDEOS_PAGE_SIZE && videos.length < videosTotal;
  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [isEditPhotoModalVisible, setIsEditPhotoModalVisible] = useState(false);
  const [isEditVideoModalVisible, setIsEditVideoModalVisible] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoType | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [form] = Form.useForm();
  const [photoForm] = Form.useForm();
  const [videoForm] = Form.useForm();
  const [editPhotoForm] = Form.useForm();
  const [editVideoForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [videoFileList, setVideoFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [fullDescriptionModal, setFullDescriptionModal] = useState<{ open: boolean; text: string }>({ open: false, text: "" });
  const [videoFullDescriptionModal, setVideoFullDescriptionModal] = useState<{ open: boolean; text: string }>({ open: false, text: "" });
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<React.Key[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<React.Key[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<React.Key[]>([]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      message.error("Не удалось загрузить список пользователей");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    dispatch(fetchPhotos());
    dispatch(fetchVideos());
  }, [dispatch]);

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

  const handleResetSelectedUserPassword = async () => {
    if (selectedUserIds.length !== 1) return;
    try {
      const { newPassword } = await resetUserPassword(selectedUserIds[0] as number);
      setGeneratedPassword(newPassword);
      setSelectedUserIds([]);
      setIsResetModalVisible(true);
    } catch (err) {
      message.error("Ошибка при сбросе пароля");
    }
  };

  const handleDeleteSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      for (const id of selectedUserIds as number[]) {
        await deleteUser(id);
      }
      message.success(`Удалено пользователей: ${selectedUserIds.length}`);
      setSelectedUserIds([]);
      loadUsers();
    } catch (err) {
      message.error("Ошибка при удалении пользователя");
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
      dispatch(fetchPhotos());
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
      setSelectedPhotoIds([]);
      dispatch(fetchPhotos());
    } catch (err) {
      message.error("Ошибка при обновлении фото");
    }
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotoIds.length === 0) return;
    try {
      await deletePhotos(selectedPhotoIds as number[]);
      message.success(`Удалено фото: ${selectedPhotoIds.length}`);
      setSelectedPhotoIds([]);
      dispatch(fetchPhotos());
    } catch (err) {
      message.error("Ошибка при удалении фото");
    }
  };

  const handleEditSelectedPhoto = () => {
    if (selectedPhotoIds.length !== 1) return;
    const record = photos.find((p) => p.id === selectedPhotoIds[0]);
    if (!record) return;
    setEditingPhoto(record);
    editPhotoForm.setFieldsValue({
      title: record.title,
      description: record.description,
      fullDescription: record.fullDescription,
    });
    setIsEditPhotoModalVisible(true);
  };

  const handleAddVideo = async (values: any) => {
    if (videoFileList.length === 0) {
      message.error("Пожалуйста, выберите видео");
      return;
    }
    setVideoUploading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.description) formData.append("description", values.description);
    if (values.fullDescription) formData.append("fullDescription", values.fullDescription);
    formData.append("video", videoFileList[0].originFileObj);

    try {
      await uploadVideo(formData);
      message.success("Видео успешно добавлено");
      setIsVideoModalVisible(false);
      videoForm.resetFields();
      setVideoFileList([]);
      dispatch(fetchVideos());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Ошибка при загрузке видео");
    } finally {
      setVideoUploading(false);
    }
  };

  const handleEditVideo = async (values: any) => {
    if (!editingVideo) return;
    try {
      await updateVideo(editingVideo.id, values);
      message.success("Видео обновлено");
      setIsEditVideoModalVisible(false);
      setEditingVideo(null);
      setSelectedVideoIds([]);
      dispatch(fetchVideos());
    } catch (err) {
      message.error("Ошибка при обновлении видео");
    }
  };

  const handleDeleteSelectedVideos = async () => {
    if (selectedVideoIds.length === 0) return;
    try {
      await deleteVideos(selectedVideoIds as number[]);
      message.success(`Удалено видео: ${selectedVideoIds.length}`);
      setSelectedVideoIds([]);
      dispatch(fetchVideos());
    } catch (err) {
      message.error("Ошибка при удалении видео");
    }
  };

  const handleEditSelectedVideo = () => {
    if (selectedVideoIds.length !== 1) return;
    const record = videos.find((v) => v.id === selectedVideoIds[0]);
    if (!record) return;
    setEditingVideo(record);
    editVideoForm.setFieldsValue({
      title: record.title,
      description: record.description,
      fullDescription: record.fullDescription,
    });
    setIsEditVideoModalVisible(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    message.success("Пароль скопирован в буфер обмена");
  };

  const userColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Имя пользователя", dataIndex: "username", key: "username" },
    { title: "Роль", dataIndex: "role", key: "role" },
  ];

  const userRowSelection = {
    selectedRowKeys: selectedUserIds,
    onChange: (keys: React.Key[]) => setSelectedUserIds(keys),
  };

  const photoColumns = [
    { 
      title: "Превью", 
      key: "preview",
      render: (_: any, record: PhotoType) => (
        <Image
          width={50}
          src={getUploadsUrl(record.filename)}
          fallback="https://via.placeholder.com/50"
        />
      )
    },
    { title: "Название", dataIndex: "title", key: "title" },
    { title: "Описание", dataIndex: "description", key: "description", ellipsis: true },
    {
      title: "Полное описание",
      dataIndex: "fullDescription",
      key: "fullDescription",
      ellipsis: true,
      render: (_text: string | undefined, record: PhotoType) => {
        const content = record.fullDescription || "—";
        return (
          <Typography.Text
            ellipsis
            style={{
              cursor: content !== "—" ? "pointer" : "default",
              color: content !== "—" ? colors.primary : undefined,
              textDecoration: content !== "—" ? "underline" : "none",
            }}
            onClick={() => content !== "—" && setFullDescriptionModal({ open: true, text: content })}
          >
            {content}
          </Typography.Text>
        );
      },
    },
    { title: "Автор", key: "author", render: (_: any, record: any) => record.user?.username },
  ];

  const photoRowSelection = {
    selectedRowKeys: selectedPhotoIds,
    onChange: (keys: React.Key[]) => setSelectedPhotoIds(keys),
  };

  const videoColumns = [
    {
      title: "Превью",
      key: "preview",
      render: (_: any, record: VideoType) => (
        <video
          src={getVideosUrl(record.filename)}
          style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }}
          preload="metadata"
          muted
          playsInline
        />
      ),
    },
    { title: "Название", dataIndex: "title", key: "title" },
    { title: "Описание", dataIndex: "description", key: "description", ellipsis: true },
    {
      title: "Полное описание",
      dataIndex: "fullDescription",
      key: "fullDescription",
      ellipsis: true,
      render: (_text: string | undefined, record: VideoType) => {
        const content = record.fullDescription || "—";
        return (
          <Typography.Text
            ellipsis
            style={{
              cursor: content !== "—" ? "pointer" : "default",
              color: content !== "—" ? colors.primary : undefined,
              textDecoration: content !== "—" ? "underline" : "none",
            }}
            onClick={() => content !== "—" && setVideoFullDescriptionModal({ open: true, text: content })}
          >
            {content}
          </Typography.Text>
        );
      },
    },
    { title: "Автор", key: "author", render: (_: any, record: any) => record.user?.username },
  ];

  const videoRowSelection = {
    selectedRowKeys: selectedVideoIds,
    onChange: (keys: React.Key[]) => setSelectedVideoIds(keys),
  };

  const items = [
    {
      key: 'users',
      label: 'Пользователи',
      children: (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <Title level={4} style={{ margin: 0 }}>Управление пользователями</Title>
            <Space>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setIsAddModalVisible(true)}
              >
                Добавить пользователя
              </Button>
              <Button
                icon={<KeyOutlined />}
                onClick={handleResetSelectedUserPassword}
                disabled={selectedUserIds.length !== 1}
              >
                Сбросить пароль
              </Button>
              <Popconfirm
                title={selectedUserIds.length > 1 ? `Удалить выбранных пользователей (${selectedUserIds.length})?` : "Удалить выбранного пользователя?"}
                onConfirm={handleDeleteSelectedUsers}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  disabled={selectedUserIds.length === 0}
                >
                  Удалить
                </Button>
              </Popconfirm>
            </Space>
          </div>
          <Table
            rowSelection={userRowSelection}
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            loading={usersLoading}
          />
        </>
      ),
    },
    {
      key: 'photos',
      label: 'Фотографии',
      children: (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <Title level={4} style={{ margin: 0 }}>Управление фотографиями</Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsPhotoModalVisible(true)}
              >
                Добавить фото
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={handleEditSelectedPhoto}
                disabled={selectedPhotoIds.length !== 1}
              >
                Редактировать
              </Button>
              <Popconfirm
                title={selectedPhotoIds.length > 1 ? `Удалить выбранные фото (${selectedPhotoIds.length})?` : "Удалить выбранное фото?"}
                onConfirm={handleDeleteSelectedPhotos}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  disabled={selectedPhotoIds.length === 0}
                >
                  Удалить
                </Button>
              </Popconfirm>
            </Space>
          </div>
          <Table
            rowSelection={photoRowSelection}
            columns={photoColumns}
            dataSource={photos}
            rowKey="id"
            loading={photosLoading}
          />
          {hasMorePhotos && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Button
                icon={<DownOutlined />}
                loading={photosLoadingMore}
                onClick={() => dispatch(fetchPhotos({ offset: photos.length, limit: PHOTOS_PAGE_SIZE }))}
              >
                Загрузить ещё ({photos.length} из {photosTotal})
              </Button>
            </div>
          )}
        </>
      ),
    },
    {
      key: "videos",
      label: "Видео",
      children: (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <Title level={4} style={{ margin: 0 }}>Управление видео</Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsVideoModalVisible(true)}
              >
                Добавить видео
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={handleEditSelectedVideo}
                disabled={selectedVideoIds.length !== 1}
              >
                Редактировать
              </Button>
              <Popconfirm
                title={selectedVideoIds.length > 1 ? `Удалить выбранные видео (${selectedVideoIds.length})?` : "Удалить выбранное видео?"}
                onConfirm={handleDeleteSelectedVideos}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  disabled={selectedVideoIds.length === 0}
                >
                  Удалить
                </Button>
              </Popconfirm>
            </Space>
          </div>
          <Table
            rowSelection={videoRowSelection}
            columns={videoColumns}
            dataSource={videos}
            rowKey="id"
            loading={videosLoading}
          />
          {hasMoreVideos && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Button
                icon={<DownOutlined />}
                loading={videosLoadingMore}
                onClick={() => dispatch(fetchVideos({ offset: videos.length, limit: VIDEOS_PAGE_SIZE }))}
              >
                Загрузить ещё ({videos.length} из {videosTotal})
              </Button>
            </div>
          )}
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
        <div style={{ marginTop: "10px", padding: "10px", background: colors.backgroundLight, borderRadius: "4px", textAlign: "center" }}>
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

      {/* Модалка просмотра полного описания */}
      <Modal
        title="Полное описание"
        open={fullDescriptionModal.open}
        onCancel={() => setFullDescriptionModal({ open: false, text: "" })}
        footer={[
          <Button key="close" type="primary" onClick={() => setFullDescriptionModal({ open: false, text: "" })}>
            Закрыть
          </Button>,
        ]}
        width={560}
      >
        <div style={{ whiteSpace: "pre-wrap", maxHeight: "60vh", overflow: "auto", padding: "8px 0" }}>
          {fullDescriptionModal.text}
        </div>
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

      {/* Модалка добавления видео */}
      <Modal
        title="Добавить видео"
        open={isVideoModalVisible}
        onCancel={() => setIsVideoModalVisible(false)}
        onOk={() => videoForm.submit()}
        confirmLoading={videoUploading}
      >
        <Form form={videoForm} layout="vertical" onFinish={handleAddVideo}>
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
          <Form.Item label="Файл (mp4, webm, mov)" required>
            <Upload
              beforeUpload={() => false}
              fileList={videoFileList}
              onChange={({ fileList }) => setVideoFileList(fileList.slice(-1))}
              maxCount={1}
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            >
              <Button icon={<UploadOutlined />}>Выбрать видео</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка редактирования видео */}
      <Modal
        title="Редактировать видео"
        open={isEditVideoModalVisible}
        onCancel={() => setIsEditVideoModalVisible(false)}
        onOk={() => editVideoForm.submit()}
      >
        <Form form={editVideoForm} layout="vertical" onFinish={handleEditVideo}>
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

      {/* Модалка полного описания видео */}
      <Modal
        title="Полное описание"
        open={videoFullDescriptionModal.open}
        onCancel={() => setVideoFullDescriptionModal({ open: false, text: "" })}
        footer={[
          <Button key="close" type="primary" onClick={() => setVideoFullDescriptionModal({ open: false, text: "" })}>
            Закрыть
          </Button>,
        ]}
        width={560}
      >
        <div style={{ whiteSpace: "pre-wrap", maxHeight: "60vh", overflow: "auto", padding: "8px 0" }}>
          {videoFullDescriptionModal.text}
        </div>
      </Modal>
    </div>
  );
};
