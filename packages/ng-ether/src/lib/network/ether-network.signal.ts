import { inject, Signal } from '@angular/core';
import { catchError, map, of, switchMap } from 'rxjs';

import {
  runInEtherInjectionContext,
  TEtherInjectOptions,
  toEtherSignal,
} from '../core/ether-injection';
import { TEtherBigNumber } from '../core/ether.type';
import { EtherNetworkService } from './ether-network.service';
import { TEtherNetwork } from './ether-network.type';

export function injectNetwork(options?: TEtherInjectOptions): Signal<TEtherNetwork | undefined> {
  return runInEtherInjectionContext(injectNetwork, options, () =>
    toEtherSignal(inject(EtherNetworkService).network$, undefined)
  );
}

export function injectChainId(options?: TEtherInjectOptions): Signal<number | undefined> {
  return runInEtherInjectionContext(injectChainId, options, () =>
    toEtherSignal(
      inject(EtherNetworkService).network$.pipe(
        map((network: TEtherNetwork) => Number(network.chainId))
      ),
      undefined
    )
  );
}

// Gas price in wei
export function injectGasFee(options?: TEtherInjectOptions): Signal<TEtherBigNumber | undefined> {
  return runInEtherInjectionContext(injectGasFee, options, () =>
    toEtherSignal(inject(EtherNetworkService).gasFee$, undefined)
  );
}

// Price in USD, undefined on a chain without price feed; read again on each network change,
// so switching from a chain without feed to a chain with one shows its price
export function injectPrice(options?: TEtherInjectOptions): Signal<number | undefined> {
  return runInEtherInjectionContext(injectPrice, options, () => {
    const networkService: EtherNetworkService = inject(EtherNetworkService);

    return toEtherSignal(
      networkService.network$.pipe(
        switchMap(() => networkService.price$.pipe(catchError(() => of(undefined))))
      ),
      undefined
    );
  });
}
