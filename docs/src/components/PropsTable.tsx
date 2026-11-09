import React from 'react';
import data from '@site/src/generated/props.json';

type PropRow = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
};

type Registry = Record<string, { file: string; props: PropRow[] }>;

const registry = data as unknown as Registry;

export interface PropsTableProps {
  /** 组件名，例如 Button（对应 src/components/Button/button.tsx 里的 ButtonProps） */
  name: string;
  /** 额外说明：透传给原生元素的属性 */
  native?: string;
}

/**
 * API 表。
 * 数据由 docs/scripts/gen-props.mjs 在每次 dev / build 前从组件的 TS 源码里解析生成，
 * 所以**永远不会和实现脱节** —— 改了 props 的 JSDoc，这里跟着变。
 */
export function PropsTable({ name, native }: PropsTableProps) {
  const entry = registry[name];

  if (!entry) {
    return (
      <p style={{ color: 'var(--oui-color-danger)', fontSize: 13 }}>
        未找到 {name} 的 props 数据，请先运行 node scripts/gen-props.mjs
      </p>
    );
  }

  return (
    <div className="oui-props">
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {entry.props.map((prop) => (
            <tr key={prop.name}>
              <td>
                <span className="oui-props__name">{prop.name}</span>
                {prop.required ? <span className="oui-props__required" title="必填">*</span> : null}
              </td>
              <td><span className="oui-props__type">{prop.type}</span></td>
              <td><span className="oui-props__default">{prop.defaultValue ?? '—'}</span></td>
              <td>{prop.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {native ? (
        <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--oui-color-text-tertiary)' }}>
          {native}
        </p>
      ) : null}
    </div>
  );
}

export default PropsTable;
