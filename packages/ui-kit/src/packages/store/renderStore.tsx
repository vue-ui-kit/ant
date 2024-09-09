import { RenderFormParams, RenderOptions, RenderTableParams } from '#/antProxy';
import {
  Button,
  Dropdown,
  RadioGroup,
  CheckboxGroup,
  TypographyParagraph,
  Switch,
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
import { set, isFunction, merge, omit } from 'lodash-es';
import { ButtonProps } from 'ant-design-vue/lib/button';
import { noValue, valued } from '@/utils/is';
import TableInput from '@/renders/TableInput.vue';
import Icon from '@/renders/Icon';
import { computed } from 'vue';

interface BtnOptions extends ButtonProps {
  content?: string;
  getContent?: (p: RenderTableParams) => string;
  dynamicClassName?: (p: RenderTableParams) => string;
  dropdowns?: BtnOptions[];
  clickEvt?: (p: RenderTableParams) => any;
}

const antDefaultProps = {
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
const defaultProps: Recordable = {
  PercentInput: {
    controls: false,
    min: 0,
    max: 100,
    addonAfter: '%',
  },
};
const componentsMap = {
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
const renderBasic = (name: string) => {
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
          {...merge({}, antDefaultProps[name], props)}
          onChange={(...arg) => {
            events.change?.({ data, field }, ...arg);
          }}
        />
      ) : (
        <DynamicComponent is={name} {...props} />
      );
    },
    renderDefault(
      { props = antDefaultProps[name] ?? {}, attrs = {}, events = {}, defaultValue }: RenderOptions,
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
          {...merge({}, antDefaultProps[name], props)}
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

const renderBtn = (btnOpt: BtnOptions, params: RenderTableParams) =>
  btnOpt.dropdowns && btnOpt.dropdowns.length > 0 ? (
    <Dropdown>
      {{
        default: () => (
          <Button
            {...omit(btnOpt, [
              'dynamicClassName',
              'content',
              'getContent',
              'icon',
              'clickEvt',
              'dropdowns',
            ])}
            icon={btnOpt.icon ? <Icon icon={btnOpt.icon} /> : null}
          >
            {btnOpt.content || (btnOpt?.getContent?.(params) ?? '')}
          </Button>
        ),
        overlay: () => (
          <div class={`dropdown-wrapper ${btnOpt?.dynamicClassName?.(params) ?? ''}`}>
            {btnOpt.dropdowns!.map((b) => renderBtn(b, params))}
          </div>
        ),
      }}
    </Dropdown>
  ) : (
    <Button
      class={btnOpt?.dynamicClassName?.(params) || ''}
      {...omit(btnOpt, [
        'dynamicClassName',
        'content',
        'getContent',
        'icon',
        'clickEvt',
        'dropdowns',
      ])}
      icon={btnOpt.icon ? <Icon icon={btnOpt.icon} /> : null}
      onClick={() => {
        if (btnOpt?.clickEvt) {
          btnOpt.clickEvt(params);
        }
      }}
    >
      {btnOpt.content || (btnOpt?.getContent?.(params) ?? '')}
    </Button>
  );
const renders = {
  ...Object.fromEntries(Object.keys(componentsMap).map((name) => [name, renderBasic(name)])),
  //简单按钮
  $button: {
    renderItemContent(
      { props = {}, events = {} }: RenderOptions,
      { data, field }: RenderFormParams,
      defaultHandler: {
        [key: string]: (...args: any[]) => any;
      },
    ) {
      return (
        <Button
          {...omit(props, ['content'])}
          icon={props.icon ? <Icon icon={props.icon} /> : null}
          onClick={() => {
            events.click?.({ data, field });
            if (props.htmlType === 'reset' && defaultHandler?.reset) {
              defaultHandler.reset({ data, field });
            }
          }}
        >
          {props.content}
        </Button>
      );
    },
    renderDefault(
      { props = {}, events = {} }: RenderOptions,
      { row, field }: RenderTableParams,
      defaultHandler: {
        [key: string]: (...args: any[]) => any;
      },
    ) {
      return (
        <Button
          {...omit(props, ['content'])}
          icon={props.icon ? <Icon icon={props.icon} /> : null}
          onClick={() => {
            events.click?.({ row, field });
            if (props.htmlType === 'reset' && defaultHandler?.reset) {
              defaultHandler.reset({ row, field });
            }
            if (props.htmlType === 'pick' && defaultHandler?.pick) {
              defaultHandler.pick({ row, field });
            }
          }}
        >
          {props.content}
        </Button>
      );
    },
  },
  // 简单按钮组
  $buttons: {
    renderItemContent(
      { props = {}, children = [] }: RenderOptions,
      { data, field }: RenderFormParams,
      defaultHandler: {
        [key: string]: (...args: any[]) => any;
      },
    ) {
      return (
        <span class="align-gap-box w-fit">
          {children.map((m) => (
            <Button
              {...omit(Object.assign(props, m.props), ['content'])}
              icon={m.props.icon ? <Icon icon={m.props.icon} /> : null}
              onClick={() => {
                m.events?.click?.({ data, field });
                if (m.props.htmlType === 'reset' && defaultHandler?.reset) {
                  defaultHandler.reset({ data, field });
                }
              }}
            >
              {m.props.content}
            </Button>
          ))}
        </span>
      );
    },
    renderDefault(
      { props = {}, children = [] }: RenderOptions,
      { data, row, field }: RenderTableParams,
    ) {
      return (
        <span class="align-gap-box w-fit">
          {children.map((m) => (
            <Button
              {...omit(Object.assign(props, m.props), ['content'])}
              icon={m.props.icon ? <Icon icon={m.props.icon} /> : null}
              onClick={() => {
                m.events?.click?.({ data, row, field });
              }}
            >
              {m.props.content}
            </Button>
          ))}
        </span>
      );
    },
  },
  ButtonTree: {
    renderDefault({ children = [], props = {} as Recordable }, params: RenderTableParams) {
      return (
        <span class={props.noGap ? 'align-no-gap-box' : 'align-gap-box'}>
          {(children as BtnOptions[]).map((item) => renderBtn(item, params)) ?? []}
        </span>
      );
    },
  },
  $radio: {
    renderItemContent({ props = {}, options }: RenderOptions, { data, field }: RenderFormParams) {
      return valued(field) ? (
        <RadioGroup
          v-model:value={data[field!]}
          {...props}
          options={props.options ?? options ?? []}
        />
      ) : null;
    },
    renderDefault({ props = {}, options }: RenderOptions, { row, field }: RenderTableParams) {
      return valued(field) ? (
        <RadioGroup
          v-model:value={row[field!]}
          {...props}
          options={props.options ?? options ?? []}
        />
      ) : null;
    },
  },
  $switch: {
    renderItemContent(
      { props = {}, events = {} }: RenderOptions,
      { data, field }: RenderFormParams,
    ) {
      return valued(field) ? (
        <Switch
          v-model:checked={data[field!]}
          {...props}
          onChange={(...arg) => {
            events.change?.({ data, field }, ...arg);
          }}
        />
      ) : null;
    },
  },
  $checkbox: {
    renderItemContent(
      { props = {}, options, events = {} }: RenderOptions,
      { data, field }: RenderFormParams,
    ) {
      return valued(field) ? (
        <CheckboxGroup
          v-model:value={data[field!]}
          {...props}
          options={props.options ?? options ?? []}
          onChange={(...arg) => {
            events.change?.({ data, field }, ...arg);
          }}
        />
      ) : null;
    },
    renderDefault({ props = {}, options }: RenderOptions, { row, field }: RenderTableParams) {
      return valued(field) ? (
        <CheckboxGroup
          v-model:value={row[field!]}
          {...props}
          options={props.options ?? options ?? []}
        />
      ) : null;
    },
  },
  $paragraph: {
    renderDefault({ props = {} }: RenderOptions, { row, field }: RenderTableParams) {
      const defaultProps = {
        ellipsis: {
          expandable: true,
          rows: 3,
        },
      };
      const content = props.getContent?.({ row, field }) ?? (valued(field) ? row[field!] : '');
      return valued(field) ? (
        <TypographyParagraph
          {...merge({}, defaultProps, omit(props, ['content', 'getContent']))}
          content={content}
        />
      ) : null;
    },
  },
  $tableInput: {
    renderItemContent(
      { props = {}, handleTrigger }: RenderOptions,
      { data, field }: RenderFormParams,
    ) {
      return valued(field) ? (
        <TableInput
          v-model={data[field!]}
          onTrigger={() => {
            if (handleTrigger && isFunction(handleTrigger)) {
              handleTrigger(props.cusFields ?? field);
            }
          }}
          editColumns={props.editColumns ?? []}
          tableConfig={props.tableConfig ?? {}}
        />
      ) : null;
    },
  },
  PercentInput: {
    renderItemContent(
      { props = {}, attrs = {} }: RenderOptions,
      { data, field }: RenderFormParams,
    ) {
      const rate = props.parse ? 100 : 1;
      if (valued(field)) {
        const percentage = computed({
          get: () => (data[field!] ?? 0) * rate,
          set: (val) => {
            data[field!] = (val ?? 0) / rate;
          },
        });
        return (
          <div class="flex items-center">
            {props.info ? <span class="pr-4">{props.info}</span> : null}
            <a-input-number
              class="w-60px!"
              {...attrs}
              v-model:value={percentage.value}
              {...merge({}, defaultProps.PercentInput, omit(props, ['info']))}
            />
          </div>
        );
      } else {
        return null;
      }
    },
    renderDefault({ props = {}, attrs = {} }: RenderOptions, { row, field }: RenderTableParams) {
      const rate = props.parse ? 100 : 1;
      if (valued(field)) {
        const percentage = computed({
          get: () => (row[field!] ?? 0) * rate,
          set: (val) => {
            set(row, field!, (val ?? 0) / rate);
          },
        });
        return [
          props.info ? <span class="pr-4">{props.info}</span> : null,
          <a-input-number
            class="w-60px!"
            {...attrs}
            v-model:value={percentage.value}
            {...merge({}, defaultProps.PercentInput, omit(props, ['info']))}
          />,
        ];
      } else {
        return null;
      }
    },
  },
  TreeSelect: {
    renderItemContent({ props = {} }: RenderOptions, { data, field }: RenderFormParams) {
      return valued(field) ? <TreeSelect v-model:value={data[field!]} {...props} /> : null;
    },
    renderDefault({ props = {} }: RenderOptions, { row, field }: RenderTableParams) {
      return valued(field) ? <TreeSelect v-model:value={row[field!]} {...props} /> : null;
    },
  },
};
export const addRender = (
  name: string,
  {
    renderItemContent,
    renderDefault,
  }: {
    renderItemContent?: (
      options: RenderOptions,
      params: RenderFormParams,
      defaultHandler: Recordable,
    ) => any;
    renderDefault?: (
      options: RenderOptions,
      params: RenderTableParams,
      defaultHandler: Recordable,
    ) => any;
  },
) => {
  if (renders.hasOwnProperty(name)) {
    console.warn(`render ${name} already exists`);
  }
  renders[name] = {
    renderItemContent,
    renderDefault,
  };
};
export default {
  renders,
  addRender,
};
