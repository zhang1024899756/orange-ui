import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './image';
import type { ImageProps } from './image';

// 用内联 SVG 渐变代替真实图片：不依赖外链，也不受主题影响
const gradientSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EFF2F9"/><stop offset="1" stop-color="#C4C3D9"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/></svg>';
const GRADIENT = 'data:image/svg+xml;utf8,' + encodeURIComponent(gradientSvg);
const BROKEN = 'data:image/png;base64,broken';

const meta = {
  title: '组件/Image 图片',
  component: Image,
  parameters: { layout: 'padded' },
  args: { src: GRADIENT, alt: '示例图片', ratio: '16:9', fit: 'cover', radius: 'md' },
  argTypes: {
    ratio: { control: 'inline-radio', options: ['1:1', '4:3', '16:9', '3:4', 'auto'] },
    fit: { control: 'inline-radio', options: ['cover', 'contain'] },
    radius: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const ratios: NonNullable<ImageProps['ratio']>[] = ['1:1', '4:3', '16:9', '3:4'];

/** 四种比例 × 两档圆角 */
export const Ratios: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {ratios.map((ratio) => (
        <div key={ratio} style={{ width: ratio === '3:4' ? 160 : 240 }}>
          <Image src={GRADIENT} alt={ratio} ratio={ratio} radius="lg" />
        </div>
      ))}
    </div>
  ),
};

/** 骨架 / 失败 / 自定义占位 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ width: 240 }}>
        <Image src={GRADIENT} alt="加载中" ratio="16:9" loading />
      </div>
      <div style={{ width: 240 }}>
        <Image src={BROKEN} alt="加载失败" ratio="16:9" />
      </div>
      <div style={{ width: 240 }}>
        <Image
          src={BROKEN}
          alt="自定义占位"
          ratio="16:9"
          fallback={<span style={{ display: 'grid', placeItems: 'center', height: '100%' }}>封面待补充</span>}
        />
      </div>
      <div style={{ width: 240 }}>
        <Image src={GRADIENT} alt="圆角胶囊" ratio="1:1" radius="2xl" />
      </div>
    </div>
  ),
};
