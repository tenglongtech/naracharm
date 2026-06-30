import { Resend } from 'resend';
import { ReactNode } from 'react';

/**
 * Resend 邮件服务
 *
 * - 本地无 API key 时,邮件内容打到 console (不阻塞开发)
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
}) {
  // 无 API key: 打到 console (开发模式)
  if (!resend) {
    console.log('\n📧 [DEV EMAIL] (未配置 Resend,仅打印)');
    console.log('  To:', params.to);
    console.log('  Subject:', params.subject);
    console.log('  (React 模板内容已生成,略)');
    console.log('');
    return { id: 'dev-mode', dev: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    react: params.react,
  });

  if (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }

  return data;
}
