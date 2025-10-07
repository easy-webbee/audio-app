import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceUS',
  standalone: true
})
export class ReplaceUSPipe implements PipeTransform {

  transform(value: string): string {
    return value ? value.replace(/_/g, ' ') : '';
  }

}
