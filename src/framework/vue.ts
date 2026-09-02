import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { applyPickerValue, readPickerValue } from './valueCodec';
import {
  WebtananDatePicker,
  type WebtananDatePickerOptions,
} from '../ui/WebtananDatePicker';

export interface WebtananVueChangeDetail {
  jalali: string | null;
  gregorian: string | null;
  time: string | null;
  dateTime: string | null;
  range: { start: string; end: string } | null;
  selectedDates: string[];
}

export const WebtananJalaliDatePickerVue = defineComponent({
  name: 'WebtananJalaliDatePicker',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Object as PropType<Partial<WebtananDatePickerOptions>>,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const host = ref<HTMLElement | null>(null);
    let picker: WebtananDatePicker | null = null;
    let listener: ((event: Event) => void) | null = null;

    const mountPicker = () => {
      if (!host.value) return;
      picker?.close();
      if (listener) host.value.removeEventListener('webtanan-date-change', listener);

      picker = new WebtananDatePicker(props.options);
      if (props.modelValue) applyPickerValue(picker, props.modelValue, props.options);
      picker.open(host.value);

      listener = (event: Event) => {
        if (!picker) return;
        const detail = (event as CustomEvent<WebtananVueChangeDetail>).detail;
        const value = readPickerValue(picker, props.options);
        emit('update:modelValue', value);
        emit('change', detail);
      };
      host.value.addEventListener('webtanan-date-change', listener);
    };

    onMounted(mountPicker);

    watch(
      () => props.options,
      () => mountPicker(),
      { deep: true },
    );

    watch(
      () => props.modelValue,
      (value) => {
        if (picker) applyPickerValue(picker, value, props.options);
      },
    );

    onBeforeUnmount(() => {
      if (host.value && listener) host.value.removeEventListener('webtanan-date-change', listener);
      picker?.close();
      picker = null;
    });

    return () => h('div', {
      ...attrs,
      ref: host,
      dir: 'rtl',
      'data-webtanan-vue-datepicker': 'true',
    });
  },
});

export default WebtananJalaliDatePickerVue;
