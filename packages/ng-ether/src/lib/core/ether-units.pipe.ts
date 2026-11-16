import { Pipe, PipeTransform } from '@angular/core';
import { BigNumberish, formatUnits } from 'ethers';

export type TEtherUnit = 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether';

// Formats a wei amount in a unit, or a number of decimals (for example 6 for USDC).
// maxDecimals truncates (never rounds up a balance), and the trailing zeros are removed: 1.50 is shown as 1.5
@Pipe({ name: 'etherUnits' })
export class EtherUnitsPipe implements PipeTransform {
  transform(
    value: BigNumberish | null | undefined,
    unit: TEtherUnit | number = 'ether',
    maxDecimals?: number
  ): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const [integer, fraction = ''] = formatUnits(value, unit).split('.');
    const decimals: string = (maxDecimals === undefined ? fraction : fraction.slice(0, maxDecimals))
      .replace(/0+$/, '');

    return decimals ? `${integer}.${decimals}` : integer;
  }
}
