/**
 * 站点配置 (从环境变量读取)
 *
 * 所有品牌/公司/联系信息集中在此,改 .env 即全站更新。
 * 条款页/footer/JSON-LD 都从这里取值。
 */

export const siteConfig = {
  brand: process.env.NEXT_PUBLIC_BRAND_NAME || 'Nara Charm',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com',
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

  // 业务参数 (与全站口径一致)
  freeShippingThresholdUsd: 120,
  returnWindowDays: 30,
};
