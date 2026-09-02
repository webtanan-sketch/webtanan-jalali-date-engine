export interface CRMCustomerEvent {
  customer: string;
  date: string;
  title: string;
  type: string;
}

export class CRMAdapter {
  private items: CRMCustomerEvent[] = [];

  addFollowUp(item: CRMCustomerEvent) {
    this.items.push(item);
  }

  getCustomerTimeline(customer: string) {
    return this.items.filter(item => item.customer === customer);
  }
}
