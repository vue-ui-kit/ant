import { createVNode } from 'vue';
import * as $Icon from '@ant-design/icons-vue';
const Icon = (props: { icon: string }) => {
  const { icon } = props;
  const antIcon: { [key: string]: any } = $Icon;
  return antIcon[icon] ? createVNode(antIcon[icon]) : antIcon[icon];
};
export default Icon;
