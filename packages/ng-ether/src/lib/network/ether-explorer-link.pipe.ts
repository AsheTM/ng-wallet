import { inject, Pipe, PipeTransform } from '@angular/core';

import { ETHER_TOKEN_EXPLORER } from '../core/ether.token';
import { TEtherExplorer } from '../core/ether.type';

export type TEtherExplorerLinkType = 'address' | 'block' | 'token' | 'tx';

// The type is detected from the value: a block number, an address (42 characters) or a transaction hash (66)
function detectType(value: string | number | bigint): TEtherExplorerLinkType | null {
  if (typeof value !== 'string') {
    return 'block';
  }

  return value.length === 42 ? 'address' : value.length === 66 ? 'tx' : null;
}

// URL of an address, a transaction, a block or a token on the block explorer of the chain,
// null on a chain without explorer (an [href] bound to null renders no link)
@Pipe({ name: 'etherExplorerLink' })
export class EtherExplorerLinkPipe implements PipeTransform {
  private readonly _explorers: Readonly<TEtherExplorer> = inject(ETHER_TOKEN_EXPLORER);

  transform(
    value: string | number | bigint | null | undefined,
    chainId: number | bigint | null | undefined,
    type?: TEtherExplorerLinkType
  ): string | null {
    if (value === null || value === undefined || value === '' || chainId === null || chainId === undefined) {
      return null;
    }

    const explorer: string | undefined = this._explorers[Number(chainId)];
    const linkType: TEtherExplorerLinkType | null = type ?? detectType(value);

    return explorer && linkType ? `${explorer.replace(/\/+$/, '')}/${linkType}/${value}` : null;
  }
}
