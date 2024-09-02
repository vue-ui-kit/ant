import { RenderFormParams, RenderOptions, RenderTableParams } from '#/antProxy';
import {
  AutoComplete,
  Cascader,
  Checkbox,
  Input,
  InputNumber,
  Select,
  DatePicker,
  RangePicker,
  Mentions,
  Rate,
  Slider,
  Textarea,
  TimePicker,
  TreeSelect,
} from 'ant-design-vue';
import { noValue, valued } from '@/utils/is';
import { merge } from 'lodash-es';

export const componentsMap = {
  $input: Input,
  AInput: Input,
  $textarea: Textarea,
  Textarea: Textarea,
  $number: InputNumber,
  AInputNumber: InputNumber,
  $select: Select,
  ASelect: Select,
  $date: DatePicker,
  ADatePicker: DatePicker,
  $range: RangePicker,
  ARangePicker: RangePicker,
  AAutoComplete: AutoComplete,
  $Cascader: Cascader,
  ACascader: Cascader,
  ACheckbox: Checkbox,
  AMentions: Mentions,
  ARate: Rate,
  ASlider: Slider,
  /*switch 用的是checked不是value🙄*/
  /*  '$switch': Switch,
    'ASwitch': Switch,*/
  $time: TimePicker,
  ATimePicker: TimePicker,
  ATreeSelect: TreeSelect,
};
const defaultProps = {
  AInput: {
    autocomplete: 'off',
  },
  $input: {
    autocomplete: 'off',
    allowClear: true,
  },
  AInputNumber: {
    min: 0,
    controls: false,
    precision: 0,
  },
  $number: {
    min: 0,
    controls: false,
    precision: 0,
  },
  $date: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
  },
  ADatePicker: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
  },
  $range: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
  },
  ARangePicker: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
  },
  $select: {
    getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode,
    allowClear: true,
    showSearch: true,
    filterOption: (input: string, option: IOption) =>
      option.label && option.label.toLowerCase().includes(input.toLowerCase()),
  },
  ASelect: {
    getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode,
    allowClear: true,
    showSearch: true,
    filterOption: (input: string, option: IOption) =>
      option.label && option.label.toLowerCase().includes(input.toLowerCase()),
  },
};
export const renderBasic = (name: string) => {
  const DynamicComponent = componentsMap[name];
  return {
    renderItemContent(
      { props = {}, attrs = {}, events = {}, defaultValue }: RenderOptions,
      { data, field }: RenderFormParams,
    ) {
      if (valued(defaultValue) && valued(field) && noValue(data[field!])) {
        data[field!] = defaultValue;
      }
      return field ? (
        <DynamicComponent
          is={name}
          v-model:value={data[field]}
          {...attrs}
          {...merge({}, defaultProps[name], props)}
          onChange={(...arg) => {
            events.change?.({ data, field }, ...arg);
          }}
        />
      ) : (
        <DynamicComponent is={name} {...props} />
      );
    },
    renderDefault(
      { props = defaultProps[name] ?? {}, attrs = {}, events = {}, defaultValue }: RenderOptions,
      { data, row, field }: RenderTableParams,
    ) {
      if (valued(defaultValue) && valued(field) && noValue(row[field!])) {
        row[field!] = defaultValue;
      }
      return field ? (
        <DynamicComponent
          is={name}
          v-model:value={row[field]}
          {...attrs}
          {...merge({}, defaultProps[name], props)}
          onChange={(...arg) => {
            events.change?.({ data, row, field }, ...arg);
          }}
        />
      ) : (
        <DynamicComponent is={name} {...props} />
      );
    },
  };
};
