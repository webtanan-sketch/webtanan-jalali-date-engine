import { DateValidator } from '../utils/DateValidator';

export type ProductionStageStatus = 'pending' | 'active' | 'done' | 'failed';

export interface ProductionStage {
  key: 'planning' | 'materials' | 'production' | 'quality' | 'packing' | 'loading' | 'delivery';
  title: string;
  date?: string;
  status: ProductionStageStatus;
  responsible?: string;
  note?: string;
  gregorianDate?: string;
  createdAt?: string;
}

export interface ProductionOrder {
  id: string;
  product: string;
  quantity?: number;
  startDate?: string;
  dueDate?: string;
  startGregorianDate?: string;
  dueGregorianDate?: string;
  createdAt?: string;
  stages: ProductionStage[];
}

const createDefaultStages = (): ProductionStage[] => [
  { key: 'planning', title: 'برنامه‌ریزی', status: 'pending' },
  { key: 'materials', title: 'تأمین مواد', status: 'pending' },
  { key: 'production', title: 'تولید', status: 'pending' },
  { key: 'quality', title: 'کنترل کیفیت', status: 'pending' },
  { key: 'packing', title: 'بسته‌بندی', status: 'pending' },
  { key: 'loading', title: 'بارگیری', status: 'pending' },
  { key: 'delivery', title: 'تحویل', status: 'pending' },
];

const cloneOrder = (order: ProductionOrder): ProductionOrder =>
  JSON.parse(JSON.stringify(order)) as ProductionOrder;

export class ProductionWorkflowAdapter {
  private orders = new Map<string, ProductionOrder>();

  createOrder(order: Omit<ProductionOrder, 'stages'> & { stages?: ProductionStage[] }): ProductionOrder {
    const id = order.id.trim();
    if (!id) throw new Error('شناسه سفارش تولید الزامی است.');
    if (this.orders.has(id)) throw new Error('این سفارش تولید قبلاً ثبت شده است.');
    if (!order.product.trim()) throw new Error('نام محصول الزامی است.');
    if (order.quantity !== undefined && (!Number.isFinite(order.quantity) || order.quantity <= 0)) {
      throw new RangeError('مقدار سفارش باید بزرگ‌تر از صفر باشد.');
    }

    const startDate = order.startDate ? DateValidator.assertString(order.startDate) : undefined;
    const dueDate = order.dueDate ? DateValidator.assertString(order.dueDate) : undefined;
    if (startDate && dueDate && startDate > dueDate) {
      throw new RangeError('تاریخ شروع تولید نباید بعد از موعد تحویل باشد.');
    }

    const inputStages = order.stages ?? createDefaultStages();
    const seen = new Set<ProductionStage['key']>();
    const stages = inputStages.map((stage) => {
      if (seen.has(stage.key)) throw new Error(`مرحله تولید تکراری است: ${stage.key}`);
      seen.add(stage.key);
      const date = stage.date ? DateValidator.assertString(stage.date) : undefined;
      return {
        ...stage,
        ...(date ? {
          date,
          gregorianDate: DateValidator.toGregorianISO(date),
          createdAt: stage.createdAt ?? new Date().toISOString(),
        } : {}),
      };
    });

    const created: ProductionOrder = {
      ...order,
      id,
      product: order.product.trim(),
      startDate,
      dueDate,
      startGregorianDate: startDate ? DateValidator.toGregorianISO(startDate) : undefined,
      dueGregorianDate: dueDate ? DateValidator.toGregorianISO(dueDate) : undefined,
      createdAt: order.createdAt ?? new Date().toISOString(),
      stages,
    };
    this.orders.set(id, created);
    return cloneOrder(created);
  }

  updateStage(orderId: string, key: ProductionStage['key'], patch: Partial<Omit<ProductionStage, 'key'>>): ProductionOrder {
    const order = this.getOrderMutable(orderId);
    const stage = order.stages.find((item) => item.key === key);
    if (!stage) throw new Error('مرحله تولید پیدا نشد.');

    if (patch.date !== undefined) {
      const date = DateValidator.assertString(patch.date);
      patch = {
        ...patch,
        date,
        gregorianDate: DateValidator.toGregorianISO(date),
        createdAt: stage.createdAt ?? new Date().toISOString(),
      };
    }
    Object.assign(stage, patch);
    return cloneOrder(order);
  }

  getOrder(orderId: string): ProductionOrder {
    return cloneOrder(this.getOrderMutable(orderId));
  }

  private getOrderMutable(orderId: string): ProductionOrder {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('سفارش تولید پیدا نشد.');
    return order;
  }

  getProgress(orderId: string): number {
    const stages = this.getOrderMutable(orderId).stages;
    if (!stages.length) return 0;
    const done = stages.filter((stage) => stage.status === 'done').length;
    return Math.round((done / stages.length) * 100);
  }

  getCurrentStage(orderId: string): ProductionStage | null {
    const stages = this.getOrderMutable(orderId).stages;
    const active = stages.find((stage) => stage.status === 'active');
    const next = active ?? stages.find((stage) => stage.status === 'pending') ?? null;
    return next ? { ...next } : null;
  }

  isDelayed(orderId: string, today: string): boolean {
    const order = this.getOrderMutable(orderId);
    if (!order.dueDate) return false;
    const current = DateValidator.assertString(today);
    const completed = order.stages.every((stage) => stage.status === 'done');
    return !completed && current > order.dueDate;
  }

  listOrders(): ProductionOrder[] {
    return [...this.orders.values()].map(cloneOrder);
  }

  toJSON(orderId: string): ProductionOrder {
    return this.getOrder(orderId);
  }

  removeOrder(orderId: string): boolean {
    return this.orders.delete(orderId);
  }

  clear(): void {
    this.orders.clear();
  }
}
