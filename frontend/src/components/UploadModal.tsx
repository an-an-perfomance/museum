import React, { useState } from "react";
import { Modal, Form, Input, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { uploadPhoto } from "../api";
import { useAppDispatch } from "../store/hooks";
import { fetchPhotos } from "../store/photosSlice";

const { Dragger } = Upload;

interface UploadModalProps {
  open: boolean;
  onCancel: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const dispatch = useAppDispatch();

  const handleUpload = async (values: any) => {
    if (fileList.length === 0) {
      message.error("Пожалуйста, выберите фото");
      return;
    }

    const formData = new FormData();
    formData.append("photo", fileList[0].originFileObj);
    formData.append("title", values.title);
    formData.append("description", values.description || "");

    setUploading(true);
    try {
      await uploadPhoto(formData);
      message.success("Фото успешно загружено");
      form.resetFields();
      setFileList([]);
      onCancel();
      dispatch(fetchPhotos());
    } catch (err) {
      message.error("Ошибка при загрузке фото");
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: any) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("Размер фото не должен превышать 10Мб");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title="Загрузить новое фото"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={uploading}
      okText="Загрузить"
      cancelText="Отмена"
    >
      <Form form={form} onFinish={handleUpload} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название фото" }]}
        >
          <Input placeholder="Например: Вид на школу в 1950-х" />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} placeholder="Дополнительная информация о фото" />
        </Form.Item>
        <Form.Item label="Фотография (макс. 10Мб)">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Нажмите или перетащите файл для загрузки</p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};
