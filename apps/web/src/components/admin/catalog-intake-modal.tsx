'use client';

import { useState } from 'react';
import { Alert, Button, Modal, Space, Table, Tag } from 'antd';
import { checkCatalogCsv, downloadCatalogCsv, saveCatalogCsv } from '@/lib/admin-catalog-intake';
import type { IntakePreview } from '@/lib/catalog-intake';

const templateNames = {
  studio: ['下载设计采集表', 'nara-studio-intake.csv'],
  photos: ['下载待补实拍表', 'nara-photo-intake.csv'],
  blank: ['下载空白表', 'nara-blank-intake.csv'],
} as const;
const actionNames = { draft: '保存草稿', publish: '上架', photo: '补实拍' };

type Props = { onClose: () => void; onSaved: (result: { drafts: number; published: number; photos: number }) => void };

function PhotoThumbnail({ src, name }: { src: string; name: string }) {
  const [size, setSize] = useState<{ width: number; height: number } | 'unavailable' | null>(null);
  if (size === 'unavailable') return <span className="text-xs font-medium text-red-700">图片加载失败</span>;
  const small = size && (size.width < 500 || size.height < 500);

  return (
    <div className="flex items-center gap-3">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
        {/* A direct browser request checks the source rather than an optimized thumbnail. */}
        <img
          src={src} alt={`${name}实拍`} width={48} height={48}
          className="h-full w-full object-contain" loading="lazy" decoding="async" referrerPolicy="no-referrer"
          onLoad={({ currentTarget }) => setSize({ width: currentTarget.naturalWidth, height: currentTarget.naturalHeight })}
          onError={() => setSize('unavailable')}
        />
      </a>
      <div className="text-xs tabular-nums">
        {size ? `${size.width} × ${size.height}` : '加载中'}
        {small && <span className="block font-medium text-amber-800">低于 500 × 500</span>}
      </div>
    </div>
  );
}

export function CatalogIntakeModal({ onClose, onSaved }: Props) {
  const [csv, setCsv] = useState('');
  const [filename, setFilename] = useState('');
  const [preview, setPreview] = useState<IntakePreview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'template' | 'reading' | 'check' | 'save' | null>(null);

  async function download(kind: keyof typeof templateNames) {
    setBusy('template');
    setError('');
    try {
      const response = await downloadCatalogCsv(kind);
      if (!response.ok) return setError(response.error);
      const url = URL.createObjectURL(new Blob([response.value], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.download = templateNames[kind][1];
      anchor.href = url;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch {
      setError('无法下载模板，请刷新后重试。');
    } finally {
      setBusy(null);
    }
  }

  async function read(file: File) {
    setPreview(null);
    setCsv('');
    setFilename('');
    setError('');
    if (file.size > 256 * 1024) {
      setError('CSV 文件不能超过 256 KB。');
      return;
    }
    setBusy('reading');
    try {
      setCsv(new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer()));
      setFilename(file.name);
    } catch {
      setError('请将文件另存为 CSV UTF-8 再导入。');
    } finally {
      setBusy(null);
    }
  }

  async function check() {
    setBusy('check');
    setError('');
    setPreview(null);
    try {
      const response = await checkCatalogCsv(csv);
      if (response.ok) setPreview(response.value);
      else setError(response.error);
    } catch {
      setError('预检失败，请重新上传。');
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!preview?.revision) return;
    setBusy('save');
    setError('');
    try {
      const response = await saveCatalogCsv(csv, preview.revision);
      if (response.ok) onSaved(response.value);
      else {
        setPreview(null);
        setError(response.error);
      }
    } catch {
      setPreview(null);
      setError('未能确认批次结果。请刷新商品列表，再重新预检。');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      open title="批量导入商品" width={880} closable={!busy} maskClosable={!busy} keyboard={!busy} onCancel={onClose}
      footer={<Space wrap>
        <Button onClick={onClose} disabled={Boolean(busy)}>取消</Button>
        <Button onClick={check} disabled={!csv || Boolean(busy)} loading={busy === 'check'}>预检清单</Button>
        <Button type="primary" onClick={save} disabled={!preview?.revision || Boolean(busy)} loading={busy === 'save'}>应用批次</Button>
      </Space>}
    >
      <Space orientation="vertical" size="middle" className="w-full">
        <p>下载模板，补上已确认的实物资料，再上传 CSV UTF-8。预检通过后即可应用批次。</p>
        <Space wrap>
          {Object.entries(templateNames).map(([kind, [label]]) => (
            <Button key={kind} onClick={() => void download(kind as keyof typeof templateNames)} disabled={Boolean(busy)}>{label}</Button>
          ))}
        </Space>
        <div className="text-sm leading-6 text-muted">
          <p><code>draft</code> 保存草稿，<code>publish</code> 明确上架，<code>photo</code> 为已有商品补主图。材质用 <code>|</code> 分隔。</p>
          <p>上架行填写正式售价、库存、实物材质、商品描述和主图，将 <code>photo_verified</code> 填为 <code>yes</code> 确认照片对应实物。</p>
        </div>
        <label className="block">
          <span className="mb-2 block font-medium">商品 CSV 文件</span>
          <input
            type="file" accept=".csv,text/csv" disabled={Boolean(busy)}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (file) void read(file);
            }}
          />
        </label>
        {filename && <p className="text-sm text-muted">{filename}</p>}
        {error && <Alert showIcon type="error" title={error} />}
        {preview && (
          <>
            <Alert showIcon type={preview.issues.length ? 'error' : 'success'} title={preview.issues.length ? `${preview.issues.length} 项需要处理` : '预检通过'} description={
              preview.issues.length ? <ul className="max-h-44 list-disc overflow-y-auto pl-5">
                {preview.issues.map(({ row, message }, index) => <li key={index}>第 {row} 行 · {message}</li>)}
              </ul> : <p>
                {preview.rows.filter(({ action }) => action === 'draft').length} 行草稿 · {preview.rows.filter(({ action }) => action === 'publish').length} 行上架 · {preview.rows.filter(({ photoUrl }) => photoUrl).length} 张实拍
              </p>
            } />
            <Table
              size="small" rowKey="row" pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }} scroll={{ x: 760, y: 315 }} dataSource={preview.rows}
              columns={[
                { title: '行号', dataIndex: 'row', width: 64 },
                { title: '操作', dataIndex: 'action', width: 90, render: (action: keyof typeof actionNames) => <Tag>{actionNames[action]}</Tag> },
                { title: '商品及网址标识', render: (_, row) => <>{row.name}<br /><span className="text-xs text-muted">{row.slug}</span></> },
                { title: 'SKU', dataIndex: 'sku', width: 170 },
                { title: '售价', dataIndex: 'priceCents', width: 85, render: (price: number | undefined) => price === undefined ? '—' : '$' + (price / 100).toFixed(2) },
                { title: '库存', dataIndex: 'stock', width: 72, render: (stock: number | undefined) => stock ?? '—' },
                {
                  title: '实拍预览', width: 168,
                  render: (_, row) => row.photoUrl ? <PhotoThumbnail key={row.photoUrl} src={row.photoUrl} name={row.name} /> : '—',
                },
              ]}
            />
          </>
        )}
      </Space>
    </Modal>
  );
}
