import { WebtananDatePicker, type WebtananDatePickerOptions } from '../ui/WebtananDatePicker';

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === 'undefined'
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class WebtananJalaliDatePickerElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ['value', 'time', 'min-date', 'max-date', 'persian-digits'];
  }

  private picker: WebtananDatePicker | null = null;
  private connected = false;

  connectedCallback(): void {
    if (typeof document === 'undefined') return;
    this.connected = true;
    this.setAttribute('dir', 'rtl');
    this.initialize();
  }

  disconnectedCallback(): void {
    this.connected = false;
    this.picker?.close();
    this.picker = null;
  }

  attributeChangedCallback(): void {
    if (this.connected) this.initialize();
  }

  get value(): string {
    return this.picker?.getDateTime() ?? '';
  }

  set value(value: string) {
    this.setAttribute('value', value);
  }

  clear(): void {
    this.picker?.clear();
    this.removeAttribute('value');
  }

  private boolAttribute(name: string, defaultValue: boolean): boolean {
    if (!this.hasAttribute(name)) return defaultValue;
    const value = this.getAttribute(name);
    return value === '' || value === 'true' || value === '1';
  }

  private optionsFromAttributes(): Partial<WebtananDatePickerOptions> {
    return {
      time: this.boolAttribute('time', false),
      persianDigits: this.boolAttribute('persian-digits', true),
      minDate: this.getAttribute('min-date') ?? undefined,
      maxDate: this.getAttribute('max-date') ?? undefined,
    };
  }

  private initialize(): void {
    if (typeof document === 'undefined') return;

    this.picker?.close();
    this.replaceChildren();
    this.picker = new WebtananDatePicker(this.optionsFromAttributes());

    const raw = this.getAttribute('value')?.trim();
    if (raw) {
      const [date, time] = raw.split(/\s+/, 2);
      this.picker.setDate(date);
      if (time && this.boolAttribute('time', false)) {
        const parts = time.split(':').map(Number);
        this.picker.setTime(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0);
      }
    }

    this.picker.open(this);
    this.addEventListener('webtanan-date-change', this.forwardChange as EventListener, { once: true });
  }

  private forwardChange = (event: CustomEvent): void => {
    this.setAttribute('value', event.detail?.dateTime ?? event.detail?.jalali ?? '');
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: event.detail,
      }),
    );
  };
}

export function defineWebtananJalaliDatePicker(tagName = 'webtanan-jalali-date-picker'): boolean {
  if (typeof customElements === 'undefined') return false;
  if (!customElements.get(tagName)) customElements.define(tagName, WebtananJalaliDatePickerElement);
  return true;
}
