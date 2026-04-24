import { createVNode } from 'vue';
import * as $Icon from '@ant-design/icons-vue';
import { getUIKitConfig } from '@/utils/config';

const Icon = (props: { icon: string }) => {
  const { icon } = props;
  const customRender = getUIKitConfig().icon?.render;
  if (customRender) {
    const custom = customRender(icon);
    if (custom) return custom;
  }
  const antIcon: { [key: string]: any } = $Icon;
  if (antIcon[icon]) return createVNode(antIcon[icon]);
  return null;
};
export default Icon;
