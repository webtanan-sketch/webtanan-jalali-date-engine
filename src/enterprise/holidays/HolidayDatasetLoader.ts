import {
  AnnualHolidayDataset,
  type AnnualHolidayDatasetPayload,
} from './AnnualHolidayDataset';

export interface HolidayDatasetFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type HolidayDatasetFetch = (
  input: string,
) => Promise<HolidayDatasetFetchResponse>;

const defaultFetch = (): HolidayDatasetFetch | null => {
  if (typeof globalThis.fetch !== 'function') return null;
  return async (input: string) => {
    const response = await globalThis.fetch(input);
    return {
      ok: response.ok,
      status: response.status,
      json: () => response.json(),
    };
  };
};

/**
 * Loader دیتاست تعطیلات رسمی سالانه.
 * هدف: اضافه‌کردن سال‌های جدید بدون تغییر هسته تقویم.
 */
export class HolidayDatasetLoader {
  constructor(private readonly fetcher: HolidayDatasetFetch | null = defaultFetch()) {}

  fromPayload(payload: AnnualHolidayDatasetPayload, expectedYear?: number): AnnualHolidayDataset {
    const dataset = new AnnualHolidayDataset(payload);
    if (expectedYear !== undefined && dataset.year !== expectedYear) {
      throw new Error(`سال دیتاست ${dataset.year} با سال مورد انتظار ${expectedYear} یکسان نیست.`);
    }
    return dataset;
  }

  fromJson(json: string, expectedYear?: number): AnnualHolidayDataset {
    const dataset = AnnualHolidayDataset.fromJSON(json);
    if (expectedYear !== undefined && dataset.year !== expectedYear) {
      throw new Error(`سال دیتاست ${dataset.year} با سال مورد انتظار ${expectedYear} یکسان نیست.`);
    }
    return dataset;
  }

  async fromUrl(url: string, expectedYear?: number): Promise<AnnualHolidayDataset> {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) throw new Error('آدرس دیتاست تعطیلات نمی‌تواند خالی باشد.');
    if (!this.fetcher) throw new Error('Fetch در این محیط در دسترس نیست؛ fetcher سفارشی تزریق کنید.');

    const response = await this.fetcher(normalizedUrl);
    if (!response.ok) {
      throw new Error(`دریافت دیتاست تعطیلات ناموفق بود. HTTP ${response.status}`);
    }

    const payload = await response.json();
    return this.fromPayload(payload as AnnualHolidayDatasetPayload, expectedYear);
  }
}
