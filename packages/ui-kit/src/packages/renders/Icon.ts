import { createVNode, type VNode } from 'vue';
import * as $Icon from '@ant-design/icons-vue';
import { getUIKitConfig } from '@/utils/config';

const Icon = (props: { icon: string }): VNode | null => {
  const { icon } = props;
  const customRender = getUIKitConfig().icon?.render;
  if (customRender) {
    const custom = customRender(icon);
    if (custom) return custom as VNode;
  }
  const antIcon: { [key: string]: any } = $Icon;
  if (antIcon[icon]) return createVNode(antIcon[icon]);
  return null;
};
export default Icon;
