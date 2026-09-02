import { ThemeManager, WEBTANAN_THEME_PRESETS } from '../src/theme/ThemeManager';
import { WebtananDatePicker } from '../src/ui/WebtananDatePicker';

describe('ThemeManager', () => {
  test('چهار تم حرفه‌ای داخلی در دسترس هستند', () => {
    expect(WEBTANAN_THEME_PRESETS.map((item) => item.name)).toEqual([
      'industrial-light',
      'navy-command',
      'steel-neutral',
      'graphite-dark',
    ]);
    expect(ThemeManager.list()).toHaveLength(4);
  });

  test('تم ناشناخته رد می‌شود', () => {
    expect(ThemeManager.isValid('childish-rainbow')).toBe(false);
    expect(() => ThemeManager.get('childish-rainbow' as never)).toThrow('ناشناخته');
    expect(() => new WebtananDatePicker({ theme: 'childish-rainbow' as never })).toThrow('ناشناخته');
  });

  test('تم روی عنصر اعمال و خوانده می‌شود', () => {
    const attributes = new Map<string, string>();
    const target = {
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
      getAttribute(name: string) {
        return attributes.get(name) ?? null;
      },
    } as unknown as HTMLElement;

    ThemeManager.apply(target, 'navy-command');
    expect(attributes.get('data-webtanan-theme')).toBe('navy-command');
    expect(ThemeManager.read(target)).toBe('navy-command');
  });

  test('متغیرهای سفارشی تم با whitelist اعمال و پاک می‌شوند', () => {
    const variables = new Map<string, string>();
    const target = {
      setAttribute() {},
      getAttribute() { return null; },
      style: {
        setProperty(name: string, value: string) { variables.set(name, value); },
        removeProperty(name: string) { variables.delete(name); return ''; },
      },
    } as unknown as HTMLElement;

    ThemeManager.applyCustomVariables(target, {
      accent: '#123456',
      'accent-contrast': '#ffffff',
      surface: '#f4f5f6',
    });

    expect(variables.get('--webtanan-accent')).toBe('#123456');
    expect(variables.get('--webtanan-accent-contrast')).toBe('#ffffff');
    ThemeManager.clearCustomVariables(target);
    expect(variables.size).toBe(0);
  });

  test('DatePicker تم را مستقل از DOM نگهداری می‌کند', () => {
    const picker = new WebtananDatePicker({ theme: 'steel-neutral' });
    expect(picker.getTheme()).toBe('steel-neutral');
    picker.setTheme('graphite-dark');
    expect(picker.getTheme()).toBe('graphite-dark');
  });

  test('تم پیش‌فرض صنعتی روشن است', () => {
    expect(ThemeManager.defaultTheme).toBe('industrial-light');
    expect(ThemeManager.get('graphite-dark').dark).toBe(true);
    expect(new WebtananDatePicker().getTheme()).toBe('industrial-light');
  });
});
