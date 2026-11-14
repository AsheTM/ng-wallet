import { inject } from '@angular/core';

import {
  listenInEtherInjectionContext,
  runInEtherInjectionContext,
  TEtherInjectOptions,
} from '../core/ether-injection';
import { EtherNetworkService } from './ether-network.service';
import { TEtherNetworkChange } from './ether-network.type';

// Calls fn on each network change, and right away with the current network (without oldNetwork)
export function onNetworkChange(
  fn: (change: TEtherNetworkChange) => void,
  options?: TEtherInjectOptions
): () => void {
  return runInEtherInjectionContext(onNetworkChange, options, () =>
    listenInEtherInjectionContext(inject(EtherNetworkService).onNetworkChange(), fn)
  );
}
