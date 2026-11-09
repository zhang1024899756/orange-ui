import React from 'react';

export interface DemoProps {
  /** 预览区里的内容 */
  children: React.ReactNode;
  /** 排列方式：inline（默认，横排换行）/ grid / block / center */
  layout?: 'inline' | 'grid' | 'block' | 'center';
  /** 底色：默认白底；subtle = 次级底（用于展示浅色组件） */
  background?: 'default' | 'subtle';
  /** 预览区下方的说明 */
  caption?: React.ReactNode;
  /** 自定义网格列数（layout=grid 时生效） */
  columns?: number;
}

/**
 * 文档里的「实时预览框」。
 * 里面渲染的是真的组件（来自 dist 打包产物），不是截图。
 */
export function Demo({ children, layout = 'inline', background = 'default', caption, columns }: DemoProps) {
  return (
    <div className="oui-demo">
      <span className="oui-demo__tag">LIVE</span>
      <div
        className="oui-demo__stage"
        data-layout={layout}
        data-bg={background === 'subtle' ? 'subtle' : undefined}
        style={columns ? { gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))' } : undefined}
      >
        {children}
      </div>
      {caption ? <div className="oui-demo__caption">{caption}</div> : null}
    </div>
  );
}

export default Demo;
