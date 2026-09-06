import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '../../services/helper.service';

@Pipe({
  name: 'recentMessage',
  standalone: true,
  pure: true,
})
export class RecentMessagePipe implements PipeTransform {
  constructor(private helperService: HelperService) {}

  transform(timestamp: any, ticker: string, range = 60): boolean {
    if (!timestamp) {
      return false;
    }

    const date = timestamp.toDate?.();

    if (!date) {
      return false;
    }

    return this.helperService.checktimeMinutesCST(ticker, date, range);
  }
}
