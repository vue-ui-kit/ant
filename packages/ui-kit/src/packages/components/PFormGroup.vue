<script lang="ts" generic="F = Recordable" setup name="PFormGroup">
  import { computed, nextTick, PropType, ref } from 'vue';
  import { PFormGroupProps, PFormBlockInstance } from '#/antProxy';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import { cloneDeep, toString, isFunction, omit } from 'lodash-es';
  import PGroupBlock from '@/components/PGroupBlock.vue';
  import {
    Card as ACard,
    Tabs as ATabs,
    TabPane as ATabPane,
    Button as AButton,
    Dropdown as ADropdown,
    Menu as AMenu,
    MenuItem as AMenuItem,
  } from 'ant-design-vue';

  const props = defineProps<PFormGroupProps<F>>();
  const model = defineModel({
    type: Array as PropType<Partial<F>[]>,
    default: () => [],
  });
  const activeKey = ref(0);
  const blockInstance = ref<PFormBlockInstance[]>([]);
  const setActiveKey = (key: number) => {
    activeKey.value = key;
  };
  const maxLen = props.max ?? Infinity;
  const handleAddItem = (idx: number) => {
    const creator = props.creatItem ?? (() => Promise.resolve({} as Partial<F>));
    creator({ list: model.value }).then((item) => {
      model.value = [...model.value, item];
      activeKey.value = idx;
    });
  };
  const itemMenus = props.itemMenus ?? [{ content: '删除', code: 'delete' }];
  const handleMenu = (key: string, item: Partial<F>, idx: number) => {
    if (props.menuHandler && isFunction(props.menuHandler)) {
      props.menuHandler({ code: key, data: item, index: idx });
    } else {
      switch (key) {
        case 'delete':
          model.value = model.value.filter((_, i) => i !== idx);
          nextTick(() => {
            blockInstance.value = blockInstance.value.filter((f) => !!f);
            if (idx <= activeKey.value && activeKey.value > 0) {
              activeKey.value--;
            }
          });
          break;
        case 'copy':
          model.value = [...model.value, cloneDeep(omit(item, ['id']))];
          break;
      }
    }
  };
  defineExpose({
    activeKey: computed(() => activeKey.value),
    setActiveKey,
    validateAll: () => {
      return Promise.all(
        blockInstance.value.map((block) => block.$form?.validate() ?? Promise.resolve()),
      );
    },
  });
</script>
<template>
  <a-card :title="title" size="small">
    <a-tabs type="editable-card" v-model:activeKey="activeKey" hide-add>
      <template #rightExtra>
        <slot name="rightExtra">
          <a-button
            type="link"
            @click="handleAddItem(model.length)"
            v-if="showAdd && model.length < maxLen"
          >
            + 新增
          </a-button>
        </slot>
      </template>
      <a-tab-pane
        v-for="(item, idx) in model"
        :key="idx"
        :tab="`${tabLabel} ${idx + 1}`"
        force-render
      >
        <template #closeIcon>
          <a-dropdown v-if="editAble && itemMenus?.length">
            <MoreOutlined />
            <template #overlay>
              <a-menu @click="(e) => handleMenu(toString(e.key), item, idx)">
                <a-menu-item
                  v-for="menu in itemMenus.filter(
                    (f) => f.visibleMethod?.({ data: item, index: idx }) ?? true,
                  )"
                  :key="menu.code"
                >
                  <div>{{ menu.content }}</div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <!-- @vue-ignore -->
        <p-group-block
          :ref="
            (i: PFormBlockInstance) => {
              if (i) {
                blockInstance[idx] = i;
              } else if (blockInstance) {
                blockInstance = blockInstance.filter((_, i) => i !== idx);
              }
            }
          "
          :key="idx"
          :source="item"
          :get-form-setting="getFormSetting"
        />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
