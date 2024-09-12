<script generic="F = Recordable" lang="ts" name="PForm" setup>
  import { PFormItemProps, PFormProps } from '#/antProxy';
  import { computed, onMounted, ref, toRefs, watch } from 'vue';
  import { debounce, omit } from 'lodash-es';
  import { v4 as uuid_v4 } from 'uuid';
  import RenderAntItem from '@/components/RenderAntItem';
  import RenderItemSlots from '@/components/RenderItemSlots';
  import { valued } from '@/utils/is';
  import { eachTree } from '@/utils/treeHelper';
  import { defaultItemResponsive } from '@/utils/core';
  import { Form as AForm, Row as ARow, Col as ACol, FormItem as AFormItem } from 'ant-design-vue';

  const props = defineProps<PFormProps<F> & { data: F }>();
  const emit = defineEmits(['apply', 'reset']);
  const { items, data: formData } = toRefs(props);

  function handleSubmit() {
    emit('apply', formData.value);
  }

  const formEl = ref();
  const renderFormKey = ref(uuid_v4());
  const resetForm = () => {
    renderFormKey.value = uuid_v4();
  };
  const debounceResetForm = debounce(resetForm, 100);
  watch(() => items.value, debounceResetForm, { deep: true });
  const resetFormData = () => {
    if (props.customReset) {
      props.customReset();
    } else {
      const obj: Partial<F> = {};
      eachTree(items.value, (item) => {
        if (item.field && item.itemRender) {
          if (valued(item.itemRender.defaultValue)) {
            obj[item.field] = item.itemRender.defaultValue;
          } else {
            obj[item.field] = undefined;
          }
        }
      });
      Object.assign(formData.value, obj);
    }
  };
  // omit({labelCol:defaultLabelCol,...props},['items','data','model'])
  const fc = computed(() => ({
    ...omit(props, ['items', 'data', 'model', 'labelCol', 'wrapperCol']),
    labelCol: props.labelCol ?? { span: 6 },
    wrapperCol: props.wrapperCol ?? { span: 16 },
  }));
  const validateField = (fields?: string | string[]) => {
    if (fields) {
      formEl.value?.validateFields(fields);
    }
  };
  const handleTrigger = (cusFields?: string | string[]) => {
    validateField(cusFields);
  };
  defineExpose({
    reset: resetForm,
    $form: computed(() => formEl.value),
  });
  onMounted(() => {
    resetForm();
  });
</script>
<template>
  <div
    v-if="items.some((s: PFormItemProps<F>) => s.field && s.itemRender)"
    class="p-pane p-wrapper"
  >
    <a-form :key="renderFormKey" ref="formEl" :model="formData" v-bind="fc" @submit="handleSubmit">
      <a-row :gutter="[6, 12]">
        <a-col
          v-for="(item, idx) in items"
          :key="'_col_' + idx"
          v-bind="item.col ?? (item.span ? { span: item.span } : defaultItemResponsive)"
        >
          <a-form-item
            :key="'_item_' + idx"
            :label="item.title"
            :name="item.field"
            :wrapper-col="item.wrapperCol ?? (item.title ? undefined : { span: 24 })"
            colon
            :class="`p-content-align-${item.align ?? 'left'}`"
            v-bind="omit(item, ['field', 'title', 'span', 'col', 'wrapperCol', 'itemRender'])"
          >
            <render-item-slots
              v-if="item.slots?.default"
              :form-data="formData"
              :item="item"
              :key="'_sl_' + (item.field ?? '_') + '_' + idx"
              :pass-trigger="handleTrigger"
            />
            <render-ant-item
              v-else-if="item.itemRender?.name"
              :key="'_re_' + (item.field ?? '_') + '_' + idx"
              :default-handler="{ reset: resetFormData }"
              :item-render="item.itemRender"
              @trigger="handleTrigger"
              :render-form-params="{ data: formData, field: item.field }"
            />
            <span v-else></span>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
