import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  guide: ['guide/index', 'guide/getting-started', 'guide/theming', 'guide/accessibility', 'changelog'],
  design: ['design/index', 'design/tokens', 'design/typography', 'design/principles'],
  components: [
    'components/index',
    {
      type: 'category',
      label: '基础',
      collapsed: false,
      items: [
        'components/button',
        'components/icon',
        'components/link',
        'components/text',
        'components/number',
        'components/image',
      ],
    },
    {
      type: 'category',
      label: '表单',
      collapsed: false,
      items: ['components/input', 'components/switch', 'components/slider'],
    },
    {
      type: 'category',
      label: '数据展示',
      collapsed: false,
      items: [
        'components/tag',
        'components/badge',
        'components/avatar',
        'components/card',
        'components/progress',
        'components/divider',
      ],
    },
    {
      type: 'category',
      label: '反馈',
      collapsed: false,
      items: [
        'components/dialog',
        'components/tooltip',
        'components/spinner',
        'components/skeleton',
        'components/empty',
      ],
    },
  ],
};

export default sidebars;
