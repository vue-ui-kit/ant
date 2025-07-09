<script generic="F = Recordable" lang="ts" name="PForm" setup>
  import { PFormItemProps, PFormProps } from '#/antProxy';
  import { computed, ref, toRefs } from 'vue';
  import { omit } from 'xe-utils';
  import { v4 as uuid_v4 } from 'uuid';
  import { isGoodValue } from '@/utils/is';
  import { eachTree } from '@/utils/treeHelper';
  import PFormCol from '@/components/PFormCol.vue';
  import {
    Form as AForm,
    Row as ARow,
  } from 'ant-design-vue';

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
  const resetFormData = () => {
    if (props.customReset) {
      props.customReset();
    } else {
      const obj: Partial<F> = {};
      eachTree(items.value, (item) => {
        if (item.field && item.itemRender) {
          if (isGoodValue(item.itemRender.defaultValue)) {
            obj[item.field] = item.itemRender.defaultValue;
          } else {
            obj[item.field] = undefined;
          }
        }
        else if (item.field && item.slots) {
          if (isGoodValue(item.slots.defaultValue)) {
            obj[item.field] = item.slots.defaultValue
          }
          else {
            obj[item.field] = undefined;
          }
        }
      });
      Object.assign(formData.value, obj);
    }
    emit('reset');
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
</script>
<template>
  <div
    v-if="items.some((s: PFormItemProps<F>) => (s.field && s.itemRender) || s.slots?.default)"
    class="p-pane p-wrapper"
  >
    <a-form :key="renderFormKey" ref="formEl" :model="formData" v-bind="fc" @submit="handleSubmit">
      <a-row :gutter="[6, 12]">
        <p-form-col
          v-for="(item, idx) in items"
          :key="`_col_${idx}`"
          :form-data="formData"
          :item="item"
          @reset="resetFormData"
          @trigger="handleTrigger"
        />
      </a-row>
    </a-form>
  </div>
</template>
