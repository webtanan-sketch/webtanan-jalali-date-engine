# راهنمای استفاده در فریم‌ورک‌ها

## نصب پایه JavaScript / TypeScript

تا قبل از انتشار رسمی در npm می‌توان مستقیماً از GitHub نصب کرد:

```bash
npm install github:webtanan-sketch/webtanan-jalali-date-engine
```

پس از انتشار رجیستری، نصب استاندارد npm نیز قابل استفاده خواهد بود.

---

## React

React به‌صورت Peer Dependency اختیاری تعریف شده است و فقط پروژه‌هایی که Adapter React را مصرف می‌کنند به React نیاز دارند.

```tsx
import { useState } from 'react';
import { WebtananJalaliDatePickerReact } from 'webtanan-jalali-date-engine/react';
import 'webtanan-jalali-date-engine/css';

export default function Example() {
  const [value, setValue] = useState('1405/06/11');

  return (
    <WebtananJalaliDatePickerReact
      value={value}
      options={{
        time: true,
        minuteStep: 15,
        theme: 'navy-command',
      }}
      onChange={(nextValue) => setValue(nextValue)}
    />
  );
}
```

حالت‌های `range` و `multiple` نیز از همان `options` هسته استفاده می‌کنند.

---

## Vue 3

Vue نیز Peer Dependency اختیاری است.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { WebtananJalaliDatePickerVue } from 'webtanan-jalali-date-engine/vue';
import 'webtanan-jalali-date-engine/css';

const value = ref('1405/06/11');
</script>

<template>
  <WebtananJalaliDatePickerVue
    v-model="value"
    :options="{
      theme: 'steel-neutral',
      time: true,
      minuteStep: 15,
    }"
  />
</template>
```

---

## Web Component / HTML ساده

برای پروژه‌هایی که React/Vue ندارند، Web Component مستقل در هسته وجود دارد و هیچ فریم‌ورک اجباری نیست.

```html
<webtanan-jalali-date-picker
  value="1405/06/11"
  theme="industrial-light"
></webtanan-jalali-date-picker>
```

خروجی Browser و CSS از مسیرهای زیر تولید می‌شوند:

- `webtanan-jalali-date-engine/browser`
- `webtanan-jalali-date-engine/browser.min`
- `webtanan-jalali-date-engine/css`

---

## Laravel / PHP

برای نصب مستقیم از GitHub، مخزن VCS را در Composer تنظیم کنید و سپس نسخه `dev-main` را نصب کنید. نصب ساده با نام پکیج فقط بعد از انتشار رسمی Packagist قابل اتکا است.

Laravel Adapter شامل Service Provider، Facade، Validation Rule، Blade View و Storeهای Cache/PDO است.

---

## Electron

هسته TypeScript/JavaScript و Web Component در Renderer قابل استفاده‌اند. برای ذخیره state نیز می‌توان از BrowserStorageAdapter، REST، Database Adapter یا Bridge اختصاصی برنامه استفاده کرد.

---

## اصل معماری

React و Vue در هسته اصلی Import نمی‌شوند. بنابراین مصرف‌کننده JavaScript، Laravel یا Electron مجبور به نصب React/Vue نیست. Adapter هر فریم‌ورک فقط از Subpath مخصوص خودش بارگذاری می‌شود.
