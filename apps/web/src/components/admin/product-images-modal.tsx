'use client';

import { useEffect, useState } from 'react';
import { Modal, Upload, Button, message, Image as AntImage, Empty, Spin, Popconfirm } from 'antd';
import { UploadOutlined, StarOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  getProductImages,
  addProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '@/lib/admin-actions';

type Img = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

/**
 * 产品图片管理 Modal
 * - 上传图片 (调 /api/admin/upload)
 * - 设置主图 / 删除
 */
export function ProductImagesModal({
  productId,
  productName,
  open,
  onClose,
}: {
  productId: string | null;
  productName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messageApi, msgCtx] = message.useMessage();

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const imgs = await getProductImages(productId);
      setImages(imgs as Img[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) load();
  }, [open, productId]);

  const handleUpload = async (file: File) => {
    if (!productId) return false;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '上传失败');
      // 第一张自动设为主图
      const isPrimary = images.length === 0;
      await addProductImage(productId, data.url, file.name, isPrimary);
      messageApi.success('图片已上传');
      await load();
    } catch (e: any) {
      messageApi.error(e.message || '上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止 antd 默认上传
  };

  const handleSetPrimary = async (imgId: string) => {
    await setPrimaryImage(imgId, productId!);
    messageApi.success('已设为主图');
    load();
  };

  const handleDelete = async (imgId: string) => {
    await deleteProductImage(imgId);
    messageApi.success('已删除');
    load();
  };

  return (
    <>
      {msgCtx}
      <Modal
        title={`图片管理 · ${productName}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={640}
        destroyOnHidden
      >
        {/* 上传区 */}
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept="image/jpeg,image/png,image/webp"
          multiple
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            上传图片 (JPG/PNG/WebP, ≤10MB)
          </Button>
        </Upload>

        {/* 图片列表 */}
        <div className="mt-4">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
          ) : images.length === 0 ? (
            <Empty description="暂无图片,请上传" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {images.map((img) => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <AntImage
                    src={img.url}
                    alt={img.altText || ''}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6 }}
                  />
                  {img.isPrimary && (
                    <span
                      style={{
                        position: 'absolute', top: 4, left: 4,
                        background: '#C4745A', color: '#fff', fontSize: 10,
                        padding: '2px 6px', borderRadius: 3,
                      }}
                    >
                      主图
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {!img.isPrimary && (
                      <Button size="small" icon={<StarOutlined />} onClick={() => handleSetPrimary(img.id)} style={{ flex: 1 }}>
                        设主图
                      </Button>
                    )}
                    <Popconfirm title="删除此图片?" onConfirm={() => handleDelete(img.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
