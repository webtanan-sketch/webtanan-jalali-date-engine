import { WebtananDatePicker, type WebtananDatePickerState } from '../ui/WebtananDatePicker';
import { JsonRepository } from './JsonRepository';

export class DatePickerPersistence {
  constructor(
    private readonly picker: WebtananDatePicker,
    private readonly repository: JsonRepository<WebtananDatePickerState>,
  ) {}

  async save(): Promise<WebtananDatePickerState> {
    const state = this.picker.exportState();
    await this.repository.save(state);
    return state;
  }

  async restore(): Promise<boolean> {
    const state = await this.repository.load();
    if (!state) return false;
    this.picker.importState(state);
    return true;
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}
