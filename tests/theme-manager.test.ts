import { ThemeManager, WEBTANAN_THEME_PRESETS } from '../src/theme/ThemeManager';

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

  test('تم پیش‌فرض صنعتی روشن است', () => {
    expect(ThemeManager.defaultTheme).toBe('industrial-light');
    expect(ThemeManager.get('graphite-dark').dark).toBe(true);
  });
});
