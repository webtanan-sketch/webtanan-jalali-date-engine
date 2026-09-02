export class DateValidator {
  static validate(year:number, month:number, day:number){
    if(month < 1 || month > 12) return false;
    if(day < 1 || day > 31) return false;
    return year > 0;
  }
}
