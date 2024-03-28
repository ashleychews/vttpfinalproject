import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'prependAt' })
export class PrependAtPipe implements PipeTransform {
    transform(value: string): string {
        return '@' + value;
    }
}
