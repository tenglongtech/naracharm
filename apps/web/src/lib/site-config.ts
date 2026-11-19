import { resolveSiteUrl } from './site-url';

const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === 'true';
const customerServices = process.env.NEXT_PUBLIC_CUSTOMER_SERVICES_ENABLED;
/**
 * 站点配置 (从环境变量读取)
 *
 * 所有品牌/公司/联系信息集中在此,改 .env 即全站更新。
 * 条款页/footer/JSON-LD 都从这里取值。
 */

export const siteConfig = {
  brand: process.env.NEXT_PUBLIC_BRAND_NAME || 'Nara Charm',
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV),
  checkoutEnabled,
  inquiryFormEnabled: process.env.NEXT_PUBLIC_INQUIRY_FORM_ENABLED === 'true',
  customerServicesEnabled: customerServices === undefined ? checkoutEnabled : customerServices === 'true',
  slogan: 'Jewelry with Spirit · Stories in Every Piece',

  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Nara Charm Limited',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Hong Kong',
    registration: process.env.NEXT_PUBLIC_COMPANY_REGISTRATION || '',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@naracharm.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@naracharm.com',
    privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@naracharm.com',
    returnAddress: process.env.NEXT_PUBLIC_RETURN_ADDRESS || 'Hong Kong',
  },

  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM || '',
    tiktok: process.env.NEXT_PUBLIC_TIKTOK || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE || '',
    pinterest: process.env.NEXT_PUBLIC_PINTEREST || '',
  },
};
