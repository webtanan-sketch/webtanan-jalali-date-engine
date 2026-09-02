export type ProductionStageStatus = 'pending' | 'active' | 'done' | 'failed';

export interface ProductionStage {
  key: 'planning' | 'materials' | 'production' | 'quality' | 'packing' | 'loading' | 'delivery';
  title: string;
  date?: string;
  status: ProductionStageStatus;
  responsible?: string;
  note?: string;
}

export interface ProductionOrder {
  id: string;
  product: string;
  quantity?: number;
  startDate?: string;
  dueDate?: string;
  stages: ProductionStage[];
}

export class ProductionWorkflowAdapter {
  private orders = new Map<string, ProductionOrder>();

  createOrder(order: Omit<ProductionOrder, 'stages'> & { stages?: ProductionStage[] }): ProductionOrder {
    if (!order.id.trim()) throw new Error('شناسه سفارش تولید الزامی است.');
    if (this.orders.has(order.id)) throw new Error('این سفارش تولید قبلاً ثبت شده است.');

    const stages: ProductionStage[] = order.stages ?? [
      { key: 'planning', title: 'برنامه‌ریزی', status: 'pending' },
      { key: 'materials', title: 'تأمین مواد', status: 'pending' },
      { key: 'production', title: 'تولید', status: 'pending' },
      { key: 'quality', title: 'کنترل کیفیت', status: 'pending' },
      { key: 'packing', title: 'بسته‌بندی', status: 'pending' },
      { key: 'loading', title: 'بارگیری', status: 'pending' },
      { key: 'delivery', title: 'تحویل', status: 'pending' },
    ];

    const created: ProductionOrder = { ...order, stages };
    this.orders.set(order.id, created);
    return created;
  }

  updateStage(orderId: string, key: ProductionStage['key'], patch: Partial<Omit<ProductionStage, 'key'>>): ProductionOrder {
    const order = this.getOrder(orderId);
    const stage = order.stages.find((item) => item.key === key);
    if (!stage) throw new Error('مرحله تولید پیدا نشد.');
    Object.assign(stage, patch);
    return order;
  }

  getOrder(orderId: string): ProductionOrder {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('سفارش تولید پیدا نشد.');
    return order;
  }

  getProgress(orderId: string): number {
    const stages = this.getOrder(orderId).stages;
    if (!stages.length) return 0;
    const done = stages.filter((stage) => stage.status === 'done').length;
    return Math.round((done / stages.length) * 100);
  }

  isDelayed(orderId: string, today: string): boolean {
    const order = this.getOrder(orderId);
    if (!order.dueDate) return false;
    const completed = order.stages.every((stage) => stage.status === 'done');
    return !completed && today > order.dueDate;
  }

  toJSON(orderId: string): ProductionOrder {
    return JSON.parse(JSON.stringify(this.getOrder(orderId)));
  }
}
