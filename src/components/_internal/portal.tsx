'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  /** 默认挂到 document.body；SSR 首帧不渲染，水合后才挂载 */
  container?: HTMLElement | null;
}

/** 内部原语：Dialog / Tooltip / Select 等浮层共用，保证 SSR 安全 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, container ?? document.body);
}
