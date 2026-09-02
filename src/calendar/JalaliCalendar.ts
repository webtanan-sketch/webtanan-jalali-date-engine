export class JalaliCalendar {
  private year: number;
  private month: number;

  constructor(year:number, month:number){
    this.year = year;
    this.month = month;
  }

  getDaysInMonth(): number {
    if (this.month <= 6) return 31;
    if (this.month <= 11) return 30;
    return 29;
  }

  getMonthName(): string {
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    return months[this.month-1] || '';
  }

  getInfo(){
    return {
      year:this.year,
      month:this.month,
      name:this.getMonthName(),
      days:this.getDaysInMonth()
    };
  }
}
