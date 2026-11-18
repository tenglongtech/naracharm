import { Resend } from 'resend';
import { ReactNode } from 'react';

/**
 * Resend 邮件服务
 *
 * - 本地无 API key 时返回开发状态
 * - 有 API key 时真实发送
 *
 * 模板: 见 emails/ 目录 (React Email)
 */
const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder'
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL || 'hello@naracharm.local';

export async function sendEmail(params: {
  to: string;
  subject: string;
  react: ReactNode;
  idempotencyKey?: string;
}) {
  if (!resend) {
    return { id: 'dev-mode', dev: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    react: params.react,
  }, params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined);

  if (error) {
    console.error('邮件发送失败:', error.name);
    throw error;
  }

  return data;
}
