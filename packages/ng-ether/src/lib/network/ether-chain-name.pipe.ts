import { Pipe, PipeTransform } from '@angular/core';

import { ETHER_CHAIN_NAME } from './ether-explorer.constant';

// Name of a chain from its ID (number, bigint or hexadecimal string), 'Chain <chainId>' for an unknown chain
@Pipe({ name: 'etherChainName' })
export class EtherChainNamePipe implements PipeTransform {
  transform(chainId: number | bigint | string | null | undefined): string | null {
    if (chainId === null || chainId === undefined || chainId === '') {
      return null;
    }

    const id = Number(BigInt(chainId));

    return ETHER_CHAIN_NAME[id] ?? `Chain ${id}`;
  }
}
