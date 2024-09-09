<script lang="ts" setup name="PGroupBlock" generic="F = Recordable">
  import { PBlockProps, PFormProps } from '#/antProxy';
  import { computed, toRefs } from 'vue';
  import PForm from '@/components/PForm.vue';

  const props = defineProps<PBlockProps<F>>();
  const { source } = toRefs(props);
  const formSetting = computed<PFormProps<Partial<F>>>(() => props.getFormSetting(source.value));
</script>
<template>
  <p-form v-bind="formSetting" :data="source!" />
</template>
