export type WebtananThemeName =
  | 'industrial-light'
  | 'navy-command'
  | 'steel-neutral'
  | 'graphite-dark';

export type WebtananThemeVariable =
  | 'bg'
  | 'surface'
  | 'surface-hover'
  | 'ink'
  | 'muted'
  | 'border'
  | 'border-strong'
  | 'accent'
  | 'accent-contrast'
  | 'range'
  | 'holiday'
  | 'work'
  | 'meeting'
  | 'closed'
  | 'disabled-bg'
  | 'disabled-ink'
  | 'shadow'
  | 'focus';

export type WebtananCustomThemeVariables = Partial<Record<WebtananThemeVariable, string>>;

export interface WebtananThemePreset {
  name: WebtananThemeName;
  titleFa: string;
  titleEn: string;
  dark: boolean;
  description: string;
}

export const WEBTANAN_THEME_PRESETS: readonly WebtananThemePreset[] = Object.freeze([
  {
    name: 'industrial-light',
    titleFa: 'صنعتی روشن',
    titleEn: 'Industrial Light',
    dark: false,
    description: 'تم پیش‌فرض روشن، خنثی و مدیریتی برای CRM، حسابداری و پنل‌های سازمانی.',
  },
  {
    name: 'navy-command',
    titleFa: 'فرماندهی سرمه‌ای',
    titleEn: 'Navy Command',
    dark: false,
    description: 'سرمه‌ای حرفه‌ای با کنتراست کنترل‌شده برای سیستم‌های مدیریتی و کارخانه‌ای.',
  },
  {
    name: 'steel-neutral',
    titleFa: 'فولادی خنثی',
    titleEn: 'Steel Neutral',
    dark: false,
    description: 'خاکستری فولادی مینیمال برای محیط‌های صنعتی، تولید و کنترل عملیات.',
  },
  {
    name: 'graphite-dark',
    titleFa: 'گرافیتی تیره',
    titleEn: 'Graphite Dark',
    dark: true,
    description: 'تم تیره حرفه‌ای با خوانایی بالا برای اتاق کنترل و استفاده طولانی‌مدت.',
  },
]);

export const WEBTANAN_THEME_VARIABLES: readonly WebtananThemeVariable[] = Object.freeze([
  'bg',
  'surface',
  'surface-hover',
  'ink',
  'muted',
  'border',
  'border-strong',
  'accent',
  'accent-contrast',
  'range',
  'holiday',
  'work',
  'meeting',
  'closed',
  'disabled-bg',
  'disabled-ink',
  'shadow',
  'focus',
]);

const THEME_NAMES = new Set<WebtananThemeName>(
  WEBTANAN_THEME_PRESETS.map((theme) => theme.name),
);

const THEME_VARIABLE_NAMES = new Set<WebtananThemeVariable>(WEBTANAN_THEME_VARIABLES);

const assertTarget = (target: HTMLElement): void => {
  if (!target || typeof target.setAttribute !== 'function') {
    throw new TypeError('target باید یک HTMLElement معتبر باشد.');
  }
};

export class ThemeManager {
  static readonly defaultTheme: WebtananThemeName = 'industrial-light';

  static isValid(theme: string): theme is WebtananThemeName {
    return THEME_NAMES.has(theme as WebtananThemeName);
  }

  static list(): WebtananThemePreset[] {
    return WEBTANAN_THEME_PRESETS.map((theme) => ({ ...theme }));
  }

  static get(theme: WebtananThemeName): WebtananThemePreset {
    const preset = WEBTANAN_THEME_PRESETS.find((item) => item.name === theme);
    if (!preset) throw new RangeError(`تم ناشناخته است: ${theme}`);
    return { ...preset };
  }

  static apply(target: HTMLElement, theme: WebtananThemeName): void {
    assertTarget(target);
    this.get(theme);
    target.setAttribute('data-webtanan-theme', theme);
  }

  static read(target: HTMLElement): WebtananThemeName {
    assertTarget(target);
    const value = target.getAttribute('data-webtanan-theme');
    return value && this.isValid(value) ? value : this.defaultTheme;
  }

  static applyCustomVariables(target: HTMLElement, variables: WebtananCustomThemeVariables): void {
    assertTarget(target);
    if (!target.style || typeof target.style.setProperty !== 'function') {
      throw new TypeError('target باید از CSSStyleDeclaration پشتیبانی کند.');
    }

    for (const [key, rawValue] of Object.entries(variables)) {
      if (!THEME_VARIABLE_NAMES.has(key as WebtananThemeVariable)) {
        throw new RangeError(`متغیر تم ناشناخته است: ${key}`);
      }
      const value = String(rawValue ?? '').trim();
      if (!value) throw new RangeError(`مقدار متغیر تم ${key} نمی‌تواند خالی باشد.`);
      target.style.setProperty(`--webtanan-${key}`, value);
    }
  }

  static clearCustomVariables(target: HTMLElement): void {
    assertTarget(target);
    if (!target.style || typeof target.style.removeProperty !== 'function') return;
    for (const key of WEBTANAN_THEME_VARIABLES) {
      target.style.removeProperty(`--webtanan-${key}`);
    }
  }
}
