<script lang="ts" setup name="PGroupBlock" generic="F extends Recordable = Recordable">
  import { PBlockProps, PFormInstance, PFormProps } from '#/antProxy';
  import { computed, ref, toRefs } from 'vue';
  import PForm from '@/components/PForm.vue';

  const props = defineProps<PBlockProps<F>>();
  const formEl = ref<PFormInstance>();
  const { source } = toRefs(props);
  const $form = computed(() => formEl.value?.$form);
  const formSetting = computed<PFormProps<Partial<F>>>(() => props.getFormSetting(source.value));
  defineExpose({
    $form,
  });
</script>
<template>
  <p-form ref="formEl" v-bind="formSetting" :data="source!" />
</template>
