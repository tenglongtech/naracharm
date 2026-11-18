'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Modal, Upload, Button, message, Image as AntImage, Empty, Spin, Popconfirm, Input } from 'antd';
import { UploadOutlined, StarOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getProductImages,
  addProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '@/lib/admin-product-images';

type Img = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  isProductPhoto: boolean;
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
  const [photoUrl, setPhotoUrl] = useState('');
  const [addingPhoto, setAddingPhoto] = useState(false);
  const hasProductPhotos = images.some((image) => image.isProductPhoto);
  const [messageApi, msgCtx] = message.useMessage();

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const imgs = await getProductImages(productId);
      setImages(imgs);
    } catch {
      messageApi.error('无法加载图片');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) {
      setPhotoUrl('');
      void load();
    }
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
      await addProductImage(productId, data.url, file.name);
      messageApi.success('图片已上传');
      await load();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止 antd 默认上传
  };

  async function handleProductPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId || !photoUrl.trim()) return;
    setAddingPhoto(true);
    try {
      await addProductImage(productId, photoUrl, productName, true);
      setPhotoUrl('');
      messageApi.success('商品实拍已添加');
      await load();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '无法添加商品实拍');
    } finally {
      setAddingPhoto(false);
    }
  }

  async function handleSetPrimary(imgId: string) {
    if (!productId) return;
    try {
      await setPrimaryImage(imgId, productId);
      messageApi.success('已设为主图');
      await load();
    } catch {
      messageApi.error('无法修改主图');
    }
  }

  async function handleDelete(imgId: string) {
    try {
      await deleteProductImage(imgId);
      messageApi.success('已删除');
      await load();
    } catch {
      messageApi.error('无法删除图片');
    }
  }

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
        <form className="mb-5 space-y-2" onSubmit={handleProductPhoto}>
          <label className="block font-medium" htmlFor="product-photo-url">商品实拍地址</label>
          <p className="text-xs text-neutral-600">填写与此款商品一致、可公开访问的 HTTPS 图片地址。重新导出商品数据后，实拍会进入商品页和购物 Feed。</p>
          <div className="flex flex-wrap gap-2">
            <Input id="product-photo-url" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} className="min-w-0 flex-1" placeholder="https://…" required />
            <Button htmlType="submit" loading={addingPhoto}>添加商品实拍</Button>
          </div>
        </form>

        {/* 本地素材上传 */}
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept="image/jpeg,image/png,image/webp"
          multiple
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            上传参考图 (JPG/PNG/WebP, ≤10MB)
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
                  {img.isProductPhoto && <p className="mt-1 text-xs font-medium text-green-700">商品实拍</p>}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {!img.isPrimary && (!hasProductPhotos || img.isProductPhoto) && (
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
