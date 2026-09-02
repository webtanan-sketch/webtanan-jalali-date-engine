export type WebtananThemeName =
  | 'industrial-light'
  | 'navy-command'
  | 'steel-neutral'
  | 'graphite-dark';

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

const THEME_NAMES = new Set<WebtananThemeName>(
  WEBTANAN_THEME_PRESETS.map((theme) => theme.name),
);

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
    if (!target || typeof target.setAttribute !== 'function') {
      throw new TypeError('target باید یک HTMLElement معتبر باشد.');
    }
    this.get(theme);
    target.setAttribute('data-webtanan-theme', theme);
  }

  static read(target: HTMLElement): WebtananThemeName {
    const value = target.getAttribute('data-webtanan-theme');
    return value && this.isValid(value) ? value : this.defaultTheme;
  }
}
