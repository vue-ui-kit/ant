<script
  lang="ts"
  setup
  generic="D extends Recordable = Recordable, F extends Recordable = Recordable"
  name="PCanvasGrid"
>
  import PCanvasTable from './PCanvasTable.vue';
  import {
    computed,
    useAttrs,
    ref,
    Ref,
    reactive,
    onMounted,
    watch,
    toRefs,
    onBeforeUnmount,
  } from 'vue';
  import {
    debounce,
    get,
    isArray,
    isBoolean,
    isFunction,
    isObject,
    isString,
    merge,
    omit,
    toNumber,
  } from 'xe-utils';
  import { PFormItemProps, ResponsePathConfig } from '#/antProxy';
  import { v4 as uuid_v4 } from 'uuid';
  import { isGoodValue } from '@/utils/is';
  import PFormCol from '@/components/PFormCol.vue';
  import { cleanCol, defaultLabelCol } from '@/utils/core';
  import Icon from '@/renders/Icon';
  import { $confirm } from '@/hooks/useMessage';
  import {
    Table as ATable,
    Button as AButton,
    Form as AForm,
    Row as ARow,
    Spin as ASpin,
  } from 'ant-design-vue';
  import { TablePaginationConfig } from 'ant-design-vue/es/table/interface';
  import { DownOutlined } from '@ant-design/icons-vue';
</script>
<template>
  <div ref="boxEl" class="h-full p-wrapper flex flex-col gap-8px overflow-y-auto" v-bind="attrs">
    <div v-if="mode === 'bad'">请检查配置</div>
    <template v-else>
      <div
        v-if="formConfig?.items?.some((s: PFormItemProps<F>) => s.field && s.itemRender)"
        class="p-pane p-form-wrapper"
        ref="pFormWrapper"
      >
        <a-spin :spinning="loading.form">
          <a-form
            :key="renderFormKey"
            ref="formEl"
            :model="queryFormData"
            v-bind="fc"
            @submit="handleFormSubmit"
          >
            <a-row :gutter="[6, 12]">
              <p-form-col
                v-for="(item, idx) in formConfig!.items"
                :key="`_col_${item.field || idx}`"
                :form-data="queryFormData"
                :item="item as PFormItemProps<Partial<F>>"
                @reset="resetQueryFormData(propsWithDefaults.lazyReset)"
              />
            </a-row>
          </a-form>
        </a-spin>
      </div>
      <div
        v-if="toolbarConfig"
        class="p-toolbar-wrapper flex items-center w-full justify-between p-theme-bg pt-8px px-16px"
      >
        <div class="flex items-center flex-1 gap-4px">
          <template v-if="toolbarConfig.buttons && toolbarConfig.buttons.length > 0">
            <template v-for="(btn, idx) in toolbarConfig.buttons" :key="idx">
              <a-dropdown v-if="btn.dropdowns && btn.dropdowns.length">
                <template #overlay>
                  <a-menu @click="toolBtnMenuClick">
                    <a-menu-item v-for="sub in btn.dropdowns" :key="sub.code"
                      >{{ sub.content }}
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button
                  :type="btn.type"
                  :size="btn.size ?? 'middle'"
                  :disabled="toolbarConfig.disabled || btn.disabled"
                  :loading="loading.toolbar || (!!btn.code && codeLoadings[btn.code])"
                >
                  <Icon v-if="btn.icon" :icon="btn.icon" />
                  {{ btn.content }}
                  <DownOutlined />
                </a-button>
              </a-dropdown>
              <a-button
                v-else-if="btn.code"
                :type="btn.type"
                :size="btn.size ?? 'middle'"
                :disabled="toolbarConfig.disabled || btn.disabled"
                :loading="loading.toolbar || (!!btn.code && codeLoadings[btn.code])"
                @click="debounceToolBtnClick(btn.code)"
              >
                <Icon v-if="btn.icon" :icon="btn.icon" />
                {{ btn.content }}
              </a-button>
              <div v-else></div>
            </template>
          </template>
        </div>
        <span class="flex items-center gap-4px">
          <template v-if="toolbarConfig.tools && toolbarConfig.tools.length > 0">
            <a-button
              v-for="(tool, idx) in toolbarConfig.tools"
              :key="idx"
              :type="tool.type"
              :size="tool.size ?? 'middle'"
              :disabled="toolbarConfig.disabled || tool.disabled"
              @click="debounceToolToolClick(tool.code)"
              :loading="loading.toolbar || (!!tool.code && codeLoadings[tool.code])"
            >
              <Icon :icon="tool.icon" />
            </a-button>
          </template>
        </span>
      </div>
      <div :class="`p-pane flex-1 ${enoughSpacing ? 'h-0' : ''} p-${scrollMode ?? 'inner'}-scroll`">
        <div
          v-if="selectConfig?.multiple && selectConfig.showCount"
          class="w-full text-slate-5 pl-4"
        >
          已选：{{ selectedRowKeys.length }}
        </div>
        <p-canvas-table
          :columns="columns"
          :data="data"
          :loading="loading.table"
          :selected-row-keys="selectedRowKeys"
          :selected-records="selectedRecords"
        />
      </div>
    </template>
  </div>
</template>
