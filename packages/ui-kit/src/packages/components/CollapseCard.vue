<script setup lang="ts">
  import { computed, h, ref } from 'vue';
  import Icon from '@/renders/Icon';
  import { getUIKitConfig } from '@/utils/config';

  interface Props {
    /** 是否默认折叠 */
    defaultCollapsed?: boolean;
    title?: string;
    /** 是否可以折叠 */
    collapsible?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: undefined,
    defaultCollapsed: false,
    collapsible: false,
  });
  const activeKey = ref(props.defaultCollapsed ? [] : ['content']);

  /** 单图标默认旋转：与业务 b-collapse-card 对齐 */
  const SINGLE_ICON_COLLAPSED_ROTATE = 0;
  const SINGLE_ICON_EXPANDED_ROTATE = -90;

  const collapseExpandIcon = computed(() => getUIKitConfig().icon?.collapseExpandIcon);

  const renderExpandIcon = ({ isActive }: { isActive?: boolean }) => {
    const cfg = collapseExpandIcon.value;
    if (!cfg) return null;

    const icon = typeof cfg === 'string' ? cfg : isActive ? cfg[1] : cfg[0];
    const rotate =
      typeof cfg === 'string'
        ? isActive
          ? SINGLE_ICON_EXPANDED_ROTATE
          : SINGLE_ICON_COLLAPSED_ROTATE
        : 0;

    return h(
      'span',
      {
        class: 'collapsible-card__expand-icon',
        style: {
          fontSize: '18px',
          display: 'inline-flex',
          transform: `rotate(${rotate}deg)`,
        },
      },
      [h(Icon, { icon })],
    );
  };

  defineExpose({
    collapse: () => {
      activeKey.value = [];
    },
    expand: () => {
      activeKey.value = ['content'];
    },
  });
</script>

<template>
  <a-collapse
    v-if="collapsible"
    v-model:active-key="activeKey"
    class="collapsible-card"
    :expand-icon="collapseExpandIcon ? renderExpandIcon : undefined"
  >
    <a-collapse-panel key="content" force-render :header="title">
      <template v-for="(_, name) in $slots" :key="name" #[name]>
        <slot :name="name" />
      </template>
    </a-collapse-panel>
  </a-collapse>
  <a-card v-else size="small" :title="title">
    <template v-for="(_, name) in $slots" :key="name" #[name]>
      <slot :name="name" />
    </template>
  </a-card>
</template>
