import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    options: { storySort: { order: ['总览', '组件', '主题'] } },
  },
  globalTypes: {
    theme: {
      description: '品牌主题',
      toolbar: { icon: 'paintbrush', items: ['orange', 'modelscope', 'teal', 'rose'], dynamicTitle: true },
    },
    scheme: {
      description: '明暗',
      toolbar: { icon: 'circlehollow', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'orange', scheme: 'light' },
  decorators: [
    (Story, context) => {
      const { theme, scheme } = context.globals as { theme: string; scheme: string };
      useEffect(() => {
        document.documentElement.setAttribute('data-oui-theme', theme);
        document.documentElement.setAttribute('data-oui-scheme', scheme);
      }, [theme, scheme]);
      return (
        <div className="oui-root" style={{ padding: 8 }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
