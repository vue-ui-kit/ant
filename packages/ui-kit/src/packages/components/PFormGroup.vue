<script lang="ts" generic="F = Recordable" setup name="PFormGroup">
  import { computed, nextTick, PropType, ref, watchEffect } from 'vue';
  import { PFormGroupProps, PFormBlockInstance } from '#/antProxy';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import { Form } from 'ant-design-vue'
  import { cloneDeep, toString, isFunction, omit, maxBy, debounce } from 'lodash-es';
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
  import { valued } from '@/utils/is';
  import { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import { $warning } from '@/hooks/useMessage';
  
  const useForm = Form.useForm
  const props = defineProps<PFormGroupProps<F>>();
  const model = defineModel({
    type: Array as PropType<Partial<F & { __index: number }>[]>,
    default: () => [],
  });
  const activeKey = ref(0);
  const blockInstance = ref<PFormBlockInstance[]>([]);
  const setActiveKey = (key: number) => {
    activeKey.value = key;
  };
  const maxLen = computed(() => props.max ?? Infinity);
  const handleAddItem = (idx: number) => {
    const creator = props.creatItem ?? (() => Promise.resolve({} as Partial<F>));
    creator({ list: model.value }).then((item) => {
      model.value = [
        ...model.value,
        {
          ...item,
          __index: (maxBy(model.value, (m) => m.__index ?? -1)?.__index ?? -1) + 1,
        } as Partial<F & { __index: number }>,
      ];
      activeKey.value = idx;
    });
  };
  const itemMenus = props.itemMenus ?? [
    { content: '复制', code: 'copy' },
    { content: '删除', code: 'delete' },
  ];
  // 实际是否强制渲染
  const fr = computed(() => {
    return props.forceRender || model.value.length <= 5
  })
  const handleTabChange = () => {
    nextTick().then(() => {
      blockInstance.value[activeKey.value]?.$form?.validate()
    })
  }
  watchEffect(() => {
    if (!props.keepSerial) {
      const unSortItems = model.value.filter((f) => !valued(f.__index));
      if (unSortItems.length > 0) {
        unSortItems.forEach((item) => {
          // @ts-ignore
          item.__index = (maxBy(model.value, (m) => m.__index ?? -1)?.__index ?? -1) + 1;
        });
      }
    }
  });
  const handleMenu = ({ key }: MenuInfo, item: Partial<F & { __index: number }>, idx: number) => {
    if (props.menuHandler && isFunction(props.menuHandler)) {
      props.menuHandler({ code: toString(key), data: item, index: idx });
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
          if (model.value.length >= maxLen.value) {
            $warning('已达到最大数量')
            return
          }
          model.value = [
            ...model.value,
            cloneDeep({
              ...omit(item, ['id', '__index']),
              __index: (maxBy(model.value, (m) => m.__index ?? -1)?.__index ?? -1) + 1,
            }),
          ] as Partial<F & { __index: number }>[];
          break;
      }
    }
  };
  const debounceHandleMenu = debounce(handleMenu, 100);
  watchEffect(() => {
    if (model.value.length === 0) {
      activeKey.value = 0;
    } else if (activeKey.value >= model.value.length) {
      activeKey.value = model.value.length - 1;
    }
  });
  defineExpose({
    activeKey: computed(() => activeKey.value),
    setActiveKey,
    validateAll: () => {
      return Promise.all(blockInstance.value.map((block, idx) =>
        fr.value ? (block.$form?.validate() ?? Promise.resolve()) : (useForm(model.value[idx], props.getFormSetting(model.value[idx]).rules)?.validate() ?? Promise.resolve()),
      ))
    },
    validate: (__index: number) => {
      const index = model.value.findIndex(f => f.__index === __index)
      return fr.value
        ? (blockInstance.value[index]?.$form?.validate() ?? Promise.resolve())
        : (useForm(model.value[index], props.getFormSetting(model.value[index]).rules)?.validate() ?? Promise.resolve())
    },
  });
</script>
<template>
  <a-card :title="title" size="small">
    <a-spin v-if="loading" class="w-full" />
    <a-tabs v-else type="editable-card" v-model:activeKey="activeKey" hide-add @change="handleTabChange">
      <template #rightExtra>
        <slot name="rightExtra">
          <a-button
            v-if="showAdd && model.length < maxLen"
            type="link"
            @click="handleAddItem(model.length)"
          >
            + 新增
          </a-button>
        </slot>
      </template>
      <a-tab-pane
        v-for="(item, idx) in model"
        :key="idx"
        :tab="`${tabLabel} ${keepSerial ? idx + 1 : (item.__index ?? 0) + 1}`"
        :force-render="fr"
      >
        <template #closeIcon>
          <a-dropdown v-if="editAble && itemMenus?.length">
            <MoreOutlined />
            <template #overlay>
              <a-menu @click="(e) => debounceHandleMenu(e, item, idx)">
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
