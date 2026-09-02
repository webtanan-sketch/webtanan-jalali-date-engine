import { AnnualHolidayDataset, type AnnualHolidayDatasetPayload } from './AnnualHolidayDataset';

const official = (date: string, title: string, id: string) => ({
  date,
  title,
  id,
  type: 'official' as const,
  source: 'movable' as const,
});

export const IRAN_OFFICIAL_HOLIDAYS_1404: AnnualHolidayDatasetPayload = {
  schemaVersion: 1,
  year: 1404,
  source: {
    title: 'تقویم رسمی کشور ۱۴۰۴ — شورای مرکز تقویم مؤسسه ژئوفیزیک دانشگاه تهران',
    url: 'https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1404.pdf/4321b7e0-d043-78ca-49f5-fbfc911e7901?t=1729620775906',
    verifiedAt: '2026-09-02',
  },
  holidays: [
    official('1404/01/01', 'آغاز نوروز', 'iran-1404-01-01'),
    official('1404/01/02', 'شهادت حضرت علی (ع) — عید نوروز', 'iran-1404-01-02'),
    official('1404/01/03', 'عید نوروز', 'iran-1404-01-03'),
    official('1404/01/04', 'عید نوروز', 'iran-1404-01-04'),
    official('1404/01/11', 'عید سعید فطر', 'iran-1404-01-11'),
    official('1404/01/12', 'تعطیل به مناسبت عید سعید فطر — روز جمهوری اسلامی ایران', 'iran-1404-01-12'),
    official('1404/01/13', 'روز طبیعت', 'iran-1404-01-13'),
    official('1404/02/04', 'شهادت امام جعفر صادق (ع)', 'iran-1404-02-04'),
    official('1404/03/14', 'رحلت امام خمینی', 'iran-1404-03-14'),
    official('1404/03/15', 'قیام ۱۵ خرداد', 'iran-1404-03-15'),
    official('1404/03/16', 'عید سعید قربان', 'iran-1404-03-16'),
    official('1404/03/24', 'عید سعید غدیر خم', 'iran-1404-03-24'),
    official('1404/04/14', 'تاسوعای حسینی', 'iran-1404-04-14'),
    official('1404/04/15', 'عاشورای حسینی', 'iran-1404-04-15'),
    official('1404/05/23', 'اربعین حسینی', 'iran-1404-05-23'),
    official('1404/05/31', 'رحلت حضرت رسول اکرم (ص) — شهادت امام حسن مجتبی (ع)', 'iran-1404-05-31'),
    official('1404/06/02', 'شهادت امام رضا (ع)', 'iran-1404-06-02'),
    official('1404/06/10', 'شهادت امام حسن عسکری (ع) — آغاز امامت حضرت ولیعصر (عج)', 'iran-1404-06-10'),
    official('1404/06/19', 'ولادت حضرت رسول اکرم (ص) — ولادت امام جعفر صادق (ع)', 'iran-1404-06-19'),
    official('1404/09/03', 'شهادت حضرت فاطمه زهرا (س)', 'iran-1404-09-03'),
    official('1404/10/13', 'ولادت امام علی (ع) — روز پدر', 'iran-1404-10-13'),
    official('1404/10/27', 'مبعث حضرت رسول اکرم (ص)', 'iran-1404-10-27'),
    official('1404/11/15', 'ولادت حضرت قائم (عج)', 'iran-1404-11-15'),
    official('1404/11/22', 'پیروزی انقلاب اسلامی ایران', 'iran-1404-11-22'),
    official('1404/12/20', 'شهادت حضرت علی (ع)', 'iran-1404-12-20'),
    official('1404/12/29', 'روز ملی شدن صنعت نفت ایران', 'iran-1404-12-29'),
  ],
};

export const IRAN_OFFICIAL_HOLIDAYS_1405: AnnualHolidayDatasetPayload = {
  schemaVersion: 1,
  year: 1405,
  source: {
    title: 'تقویم رسمی کشور ۱۴۰۵ — شورای مرکز تقویم مؤسسه ژئوفیزیک دانشگاه تهران',
    url: 'https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1405.pdf',
    verifiedAt: '2026-09-02',
  },
  holidays: [
    official('1405/01/01', 'عید سعید فطر — آغاز نوروز', 'iran-1405-01-01'),
    official('1405/01/02', 'تعطیل به مناسبت عید سعید فطر — عید نوروز', 'iran-1405-01-02'),
    official('1405/01/03', 'عید نوروز', 'iran-1405-01-03'),
    official('1405/01/04', 'عید نوروز', 'iran-1405-01-04'),
    official('1405/01/12', 'روز جمهوری اسلامی ایران', 'iran-1405-01-12'),
    official('1405/01/13', 'روز طبیعت', 'iran-1405-01-13'),
    official('1405/01/25', 'شهادت امام جعفر صادق (ع)', 'iran-1405-01-25'),
    official('1405/03/06', 'عید سعید قربان', 'iran-1405-03-06'),
    official('1405/03/14', 'عید سعید غدیر خم — رحلت امام خمینی', 'iran-1405-03-14'),
    official('1405/03/15', 'قیام ۱۵ خرداد', 'iran-1405-03-15'),
    official('1405/04/03', 'تاسوعای حسینی', 'iran-1405-04-03'),
    official('1405/04/04', 'عاشورای حسینی', 'iran-1405-04-04'),
    official('1405/05/13', 'اربعین حسینی', 'iran-1405-05-13'),
    official('1405/05/21', 'رحلت حضرت رسول اکرم (ص) — شهادت امام حسن مجتبی (ع)', 'iran-1405-05-21'),
    official('1405/05/22', 'شهادت امام رضا (ع)', 'iran-1405-05-22'),
    official('1405/05/30', 'شهادت امام حسن عسکری (ع) — آغاز امامت حضرت ولیعصر (عج)', 'iran-1405-05-30'),
    official('1405/06/08', 'ولادت حضرت رسول اکرم (ص) — ولادت امام جعفر صادق (ع)', 'iran-1405-06-08'),
    official('1405/08/22', 'شهادت حضرت فاطمه زهرا (س)', 'iran-1405-08-22'),
    official('1405/10/02', 'ولادت امام علی (ع) — روز پدر', 'iran-1405-10-02'),
    official('1405/10/16', 'مبعث حضرت رسول اکرم (ص)', 'iran-1405-10-16'),
    official('1405/11/04', 'ولادت حضرت قائم (عج)', 'iran-1405-11-04'),
    official('1405/11/22', 'پیروزی انقلاب اسلامی ایران', 'iran-1405-11-22'),
    official('1405/12/09', 'شهادت حضرت علی (ع)', 'iran-1405-12-09'),
    official('1405/12/19', 'عید سعید فطر', 'iran-1405-12-19'),
    official('1405/12/20', 'تعطیل به مناسبت عید سعید فطر', 'iran-1405-12-20'),
    official('1405/12/29', 'روز ملی شدن صنعت نفت ایران', 'iran-1405-12-29'),
  ],
};

const BUILTIN_DATASETS: Record<number, AnnualHolidayDatasetPayload> = {
  1404: IRAN_OFFICIAL_HOLIDAYS_1404,
  1405: IRAN_OFFICIAL_HOLIDAYS_1405,
};

export const IRAN_OFFICIAL_DATASET_YEARS = Object.freeze(
  Object.keys(BUILTIN_DATASETS).map(Number).sort((a, b) => a - b),
);

export function getIranOfficialHolidayDataset(year: number): AnnualHolidayDataset | null {
  const payload = BUILTIN_DATASETS[year];
  return payload ? new AnnualHolidayDataset(payload) : null;
}
