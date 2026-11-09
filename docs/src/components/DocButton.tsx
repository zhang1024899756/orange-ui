import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Button } from '@arvinzxy/orange-ui';
import type { ButtonProps } from '@arvinzxy/orange-ui';

/**
 * 文档站里「点一下要跳转」的按钮统一走它。
 *
 * 直接写 <Button href="/guide/x"> 会漏掉 baseUrl —— 站点部署在 GitHub Pages 的
 * /orange-ui/ 子路径下，绝对路径 /guide/x 线上是 404。这里把路径交给 useBaseUrl 拼。
 */
export function DocButton({ to, ...rest }: ButtonProps & { to: string }) {
  const href = useBaseUrl(to);
  return <Button href={href} {...rest} />;
}
