import React from 'react';

export interface SwatchProps {
  /** CSS 变量名，例如 --oui-color-primary */
  name: string;
  /** 文字里写的值（静态值；随主题变化的项写「随主题」） */
  value?: string;
  /** 色块填充；默认用 var(name) */
  fill?: string;
  /** 色块下方的一句话用途 */
  usage?: string;
  /** 用边框+透明底展示（适合 10% 透明这类色块） */
  checker?: boolean;
}

/**
 * 单个设计变量色块。填充直接取 var(--oui-*)，所以切换主题时色块跟着变——
 * 这一页本身就是一个主题切换的演示。
 */
export function Swatch({ name, value, fill, usage, checker }: SwatchProps) {
  return (
    <div className="oui-swatch">
      <div
        className="oui-swatch__chip"
        style={{
          background: fill ?? ('var(' + name + ')'),
          backgroundImage: checker
            ? 'linear-gradient(45deg, var(--oui-color-bg-muted) 25%, transparent 25%, transparent 75%, var(--oui-color-bg-muted) 75%), linear-gradient(45deg, var(--oui-color-bg-muted) 25%, transparent 25%, transparent 75%, var(--oui-color-bg-muted) 75%)'
            : undefined,
          backgroundSize: checker ? '10px 10px' : undefined,
          backgroundPosition: checker ? '0 0, 5px 5px' : undefined,
        }}
      />
      <div className="oui-swatch__meta">
        <div className="oui-swatch__name">{name}</div>
        {value ? <div className="oui-swatch__value">{value}</div> : null}
        {usage ? <div style={{ color: 'var(--oui-color-text-secondary)', marginTop: 2 }}>{usage}</div> : null}
      </div>
    </div>
  );
}

export default Swatch;
