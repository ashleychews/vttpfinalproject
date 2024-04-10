import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hideSelfName'
})
export class HideSelfNamePipe implements PipeTransform {
  transform(senderEmail: string, loggedInUserEmail: string): string {
    return senderEmail === loggedInUserEmail ? 'You' : senderEmail;
  }
}
