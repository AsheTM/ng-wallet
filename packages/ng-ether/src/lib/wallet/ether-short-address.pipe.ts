import { Pipe, PipeTransform } from '@angular/core';

// 0x1234…abcd: start and end are the numbers of characters kept, "0x" included in start
@Pipe({ name: 'etherShortAddress' })
export class EtherShortAddressPipe implements PipeTransform {
  transform(address: string | null | undefined, start = 6, end = 4): string | null {
    if (!address) {
      return null;
    }

    return address.length > start + end + 1
      ? `${address.slice(0, start)}…${end > 0 ? address.slice(-end) : ''}`
      : address;
  }
}
