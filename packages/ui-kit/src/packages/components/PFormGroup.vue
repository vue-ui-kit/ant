<script lang="ts" generic="F extends Recordable = Recordable" setup name="PFormGroup">
  import { computed, nextTick, PropType, ref, watch, watchEffect } from 'vue';
  import { PFormGroupProps, PFormBlockInstance } from '#/antProxy';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import type { Tabs } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/lib/form';
  import { Form } from 'ant-design-vue';
  import { clone, toString, isFunction, omit, max, debounce } from 'xe-utils';
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
  import CollapseCard from './CollapseCard.vue';

  const useForm = Form.useForm;
  const tabsRef = ref<InstanceType<typeof Tabs>>();
  const props = defineProps<PFormGroupProps<F>>();
  const rootRef = ref<InstanceType<typeof CollapseCard>>();
  const model = defineModel({
    type: Array as PropType<Partial<F & { __index: number }>[]>,
    default: () => [],
  });
  const activeKey = ref(0);
  const error_indexes = ref<number[]>([]);
  const blockInstance = ref<PFormBlockInstance[]>([]);
  const setActiveKey = (key: number) => {
    activeKey.value = key;
  };
  const maxLen = computed(() => props.max ?? Infinity);
  const handleAddItem = (idx: number) => {
    const creator = props.createItem ?? (() => Promise.resolve({} as Partial<F>));
    creator({ list: model.value }).then((item) => {
      model.value = [
        ...model.value,
        {
          ...item,
          __index: (max(model.value, (m) => m.__index ?? -1)?.__index ?? -1) + 1,
        } as Partial<F & { __index: number }>,
      ];
      activeKey.value = idx;
    });
  };
  const itemMenus = props.itemMenus ?? [
    { content: '复制', code: 'copy' },
    { content: '删除', code: 'delete' },
  ];
  const getPopupContainer = (el: HTMLElement) =>
    el?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement ??
    rootRef.value?.$el ??
    document.body;
  // 实际是否强制渲染
  const fr = computed(() => {
    return props.forceRender || model.value.length <= 5;
  });
  const handleBlockFocus = (idx: number) => {
    const target_index = model.value.find((f, index) => index === idx)?.__index;
    if (valued(target_index)) {
      error_indexes.value = error_indexes.value.filter((f) => f !== target_index);
    }
  };
  const handleTabChange = () => {
    nextTick().then(() => {
      handleBlockFocus(activeKey.value);
      blockInstance.value[activeKey.value]?.$form?.validate();
    });
  };
  watch(
    () => model.value,
    () => {
      if (!props.keepSerial) {
        const unSortItems = model.value.filter((f) => !valued(f.__index));
        if (unSortItems.length > 0) {
          unSortItems.forEach((item) => {
            // @ts-ignore
            item.__index = (max(model.value, (m) => m.__index ?? -1)?.__index ?? -1) + 1;
          });
        }
      }
    },
    { immediate: true },
  );
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
            $warning('已达到最大数量');
            return;
          }
          model.value = [
            ...model.value,
            clone({
              ...omit(item, ['id', '__index']),
              __index: (max(model.value, (m) => m.__index ?? -1)?.__index ?? -1) + 1,
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

  const debounceHandleBlockFocus = debounce(handleBlockFocus, 50);
  watchEffect(() => {
    const errorKeys = model.value
      .map((m, idx) => (error_indexes.value.includes(m.__index!) ? idx : undefined))
      .filter(valued);
    const rootDom = tabsRef.value?.$el;
    if (rootDom) {
      const tabPanel = rootDom.querySelectorAll(
        ':scope >.ant-tabs-nav>.ant-tabs-nav-wrap>.ant-tabs-nav-list>.ant-tabs-tab>.ant-tabs-tab-btn',
      );
      tabPanel.forEach((tab, idx) => {
        if (errorKeys.includes(idx)) {
          tab.classList.add('p-error-group-tab');
        } else {
          tab.classList.remove('p-error-group-tab');
        }
      });
    }
  });
  defineExpose({
    collapse: () => {
      rootRef.value?.collapse?.();
    },
    expand: () => {
      rootRef.value?.expand?.();
    },
    activeKey: computed(() => activeKey.value),
    setActiveKey,
    validateAll: () => {
      const promiseList = fr.value
        ? blockInstance.value.map((block) => block.$form?.validate())
        : model.value.map(
            (m) => useForm(m, props.getFormSetting(m).rules)?.validate() ?? Promise.resolve(),
          );
      return Promise.allSettled(promiseList).then((results) => {
        // 更新 error_indexes
        error_indexes.value = results
          .map((res, idx) =>
            res.status === 'rejected' && typeof model.value[idx]?.__index === 'number'
              ? (model.value[idx].__index as number)
              : undefined,
          )
          .filter((v): v is number => typeof v === 'number');
        if (!props.lazyErrorMark && error_indexes.value.length) {
          // 跳到第一个出错的tab
          const firstErrorIndex = error_indexes.value[0];
          const firstErrorTab = model.value.findIndex((f) => f.__index === firstErrorIndex);
          if (firstErrorTab !== -1) {
            activeKey.value = firstErrorTab;
          }
        }
        // 判断是否有错误
        if (error_indexes.value.length) {
          return Promise.reject({ error_indexes: error_indexes.value, results });
        }
        return Promise.resolve(results);
      });
    },
    validate: async (__index: number, ignoreTabError?: boolean) => {
      const index = model.value.findIndex((f) => f.__index === __index);
      try {
        await (fr.value
          ? (blockInstance.value[index]?.$form?.validate() ?? Promise.resolve())
          : (useForm(
              model.value[index],
              props.getFormSetting(model.value[index]).rules,
            )?.validate() ?? Promise.resolve()));
        // 校验通过，移除error_indexes中的__index
        error_indexes.value = error_indexes.value.filter((f) => f !== __index);
        return Promise.resolve();
      } catch (e) {
        // 校验失败，加入error_indexes
        if (!error_indexes.value.includes(__index) && !ignoreTabError) {
          error_indexes.value = [...error_indexes.value, __index];
        }
        return Promise.reject(e);
      }
    },
    validateFields: async (__index: number, fields: string[], ignoreTabError?: boolean) => {
      const index = model.value.findIndex((f) => f.__index === __index);
      const formSettings = props.getFormSetting(model.value[index]);
      const rules = formSettings.rules as Record<string, Rule[]>;
      const dataFormFactory = useForm(model.value[index], rules);
      try {
        await (fr.value
          ? (blockInstance.value[index]?.$form?.validateFields(fields) ?? Promise.resolve())
          : Promise.allSettled(
              fields.map((m) =>
                dataFormFactory.validateField(
                  m,
                  model.value[index][m],
                  (rules[m] as Record<string, unknown>[]) ?? [],
                ),
              ),
            ));
        return Promise.resolve();
      } catch (e) {
        // 校验失败，加入error_indexes
        if (!error_indexes.value.includes(__index) && !ignoreTabError) {
          error_indexes.value = [...error_indexes.value, __index];
        }
        return Promise.reject(e);
      }
    },
  });
</script>
<template>
  <collapse-card
    ref="rootRef"
    :title="title"
    size="small"
    :collapsible="collapsible"
    :default-collapsed="defaultCollapsed"
  >
    <a-spin v-if="loading" class="w-full" />
    <a-tabs
      v-else
      ref="tabsRef"
      type="editable-card"
      v-model:activeKey="activeKey"
      hide-add
      @change="handleTabChange"
    >
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
          <a-dropdown v-if="editAble && itemMenus?.length" :get-popup-container="getPopupContainer">
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
        <p-group-block
          ref="blockInstance"
          :key="idx"
          :source="item"
          :get-form-setting="getFormSetting"
          @focus.capture="debounceHandleBlockFocus(idx)"
          @click.capture="debounceHandleBlockFocus(idx)"
        />
      </a-tab-pane>
    </a-tabs>
  </collapse-card>
</template>
