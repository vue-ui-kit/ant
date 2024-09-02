<script lang="ts" setup name="PGroupBlock" generic="F = Recordable">
  import { PFormProps } from '#/antProxy';
  import { computed, toRefs } from 'vue';
  import PForm from '@/components/PForm.vue';

  interface IProps {
    getFormSetting: (data: Partial<F>) => PFormProps<Partial<F>>;
    source: Partial<F>;
  }

  const props = defineProps<IProps>();
  const { source } = toRefs(props);
  const formSetting = computed<PFormProps<Partial<F>>>(() => props.getFormSetting(source.value));
</script>
<template>
  <p-form v-bind="formSetting" :data="source!" />
</template>
