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
  variantId: string | null;
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
  const [variantId, setVariantId] = useState('');
  const [variants, setVariants] = useState<Awaited<ReturnType<typeof getProductImages>>['variants']>([]);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const hasSharedPhotos = images.some((image) => !image.variantId && image.isProductPhoto);
  const [messageApi, msgCtx] = message.useMessage();

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const result = await getProductImages(productId);
      setImages(result.images);
      setVariants(result.variants);
    } catch {
      messageApi.error('无法加载图片');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) {
      setPhotoUrl('');
      setVariantId('');
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
      const variant = variants.find((candidate) => candidate.id === variantId);
      await addProductImage(productId, photoUrl, variant ? `${productName} ${variant.name}` : productName, true, variantId || undefined);
      setPhotoUrl('');
      messageApi.success('商品实拍已添加');
      await load();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '无法添加商品实拍');
    } finally {
      setAddingPhoto(false);
    }
  }

  async function handleSetPrimary(img: Img) {
    if (!productId) return;
    try {
      await setPrimaryImage(img.id, productId, img.variantId ?? undefined);
      messageApi.success('已设为主图');
      await load();
    } catch {
      messageApi.error('无法修改主图');
    }
  }

  async function handleDelete(img: Img) {
    try {
      await deleteProductImage(img.id, img.variantId ?? undefined);
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
          <p className="text-xs text-neutral-600">填写公开 HTTPS 图片地址。颜色或材质不同的规格请分别添加实拍。</p>
          {variants.length > 0 && (
            <label className="flex flex-col gap-1 text-sm" htmlFor="product-photo-scope">
              适用规格
              <select
                id="product-photo-scope" value={variantId} disabled={loading || addingPhoto}
                onChange={(event) => setVariantId(event.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5"
              >
                <option value="">所有规格通用</option>
                {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name} · {variant.sku}</option>)}
              </select>
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <Input id="product-photo-url" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} className="min-w-0 flex-1" placeholder="https://…" required />
            <Button htmlType="submit" disabled={loading} loading={addingPhoto}>添加商品实拍</Button>
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
                <div key={`${img.variantId ?? 'shared'}:${img.id}`} style={{ position: 'relative' }}>
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
                  {img.isProductPhoto && (
                    <p className="mt-1 break-words text-xs font-medium text-green-700">
                      {img.variantId ? `规格实拍 · ${variants.find(({ id }) => id === img.variantId)?.sku ?? ''}` : '通用实拍'}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {!img.isPrimary && (img.isProductPhoto || (!img.variantId && !hasSharedPhotos)) && (
                      <Button size="small" icon={<StarOutlined />} onClick={() => handleSetPrimary(img)} style={{ flex: 1 }}>
                        设主图
                      </Button>
                    )}
                    <Popconfirm title="删除此图片?" onConfirm={() => handleDelete(img)}>
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
