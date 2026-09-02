export class CalendarRenderer {
  private weekDays = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];

  render(year:number, month:number){
    return {
      year,
      month,
      weekDays:this.weekDays,
      days:[]
    };
  }

  selectDay(day:number){
    return {day};
  }
}
