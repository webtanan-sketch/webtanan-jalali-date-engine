import React, { useEffect, useRef } from 'react';
import { applyPickerValue, readPickerValue } from './valueCodec';
import {
  WebtananDatePicker,
  type WebtananDatePickerOptions,
} from '../ui/WebtananDatePicker';

export interface WebtananReactChangeDetail {
  jalali: string | null;
  gregorian: string | null;
  time: string | null;
  dateTime: string | null;
  range: { start: string; end: string } | null;
  selectedDates: string[];
}

export interface WebtananReactDatePickerProps {
  options?: Partial<WebtananDatePickerOptions>;
  value?: string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string, detail: WebtananReactChangeDetail) => void;
}

export function WebtananJalaliDatePickerReact({
  options = {},
  value,
  className,
  style,
  onChange,
}: WebtananReactDatePickerProps): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<WebtananDatePicker | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const picker = new WebtananDatePicker(options);
    pickerRef.current = picker;
    if (value) applyPickerValue(picker, value, options);
    picker.open(host);

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<WebtananReactChangeDetail>).detail;
      onChange?.(readPickerValue(picker, optionsRef.current), detail);
    };
    host.addEventListener('webtanan-date-change', listener);

    return () => {
      host.removeEventListener('webtanan-date-change', listener);
      picker.close();
      pickerRef.current = null;
    };
  }, [options, onChange]);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;
    applyPickerValue(picker, value, optionsRef.current);
  }, [value]);

  return React.createElement('div', {
    ref: hostRef,
    className,
    style,
    dir: 'rtl',
    'data-webtanan-react-datepicker': 'true',
  });
}

export default WebtananJalaliDatePickerReact;
