'use client';

import { useServerInsertedHTML } from 'next/navigation';
import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

/**
 * antd SSR 样式 Registry
 * 包裹整个 app,解决 antd CSS-in-JS 在 Next.js App Router 下的首屏样式注入问题
 * 参考: https://ant.design/docs/react/use-with-next-js
 */

// Nara Charm 品牌主题 (砖红/深棕/金)
const theme = {
  token: {
    colorPrimary: '#C4745A', // 砖红
    colorBgLayout: '#FAF7F1', // 奶白背景
    borderRadius: 4,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
