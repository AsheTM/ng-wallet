import { inject, Signal } from '@angular/core';

import {
  runInEtherInjectionContext,
  TEtherInjectOptions,
  toEtherSignal,
} from '../core/ether-injection';
import { TEtherBigNumber } from '../core/ether.type';
import { EtherWalletService } from './ether-wallet.service';

// Selected account, undefined when disconnected or without wallet
export function injectAccount(options?: TEtherInjectOptions): Signal<string | undefined> {
  return runInEtherInjectionContext(injectAccount, options, () =>
    toEtherSignal<string | undefined, undefined>(inject(EtherWalletService).account$, undefined)
  );
}

// Connected accounts, empty when disconnected or without wallet
export function injectAccounts(options?: TEtherInjectOptions): Signal<string[]> {
  return runInEtherInjectionContext(injectAccounts, options, () =>
    toEtherSignal<string[], string[]>(inject(EtherWalletService).onAccountChange(), [])
  );
}

export function injectIsConnected(options?: TEtherInjectOptions): Signal<boolean> {
  return runInEtherInjectionContext(injectIsConnected, options, () =>
    toEtherSignal<boolean, boolean>(inject(EtherWalletService).onConnect(), false)
  );
}

// Balance of the selected account in wei
export function injectBalance(options?: TEtherInjectOptions): Signal<TEtherBigNumber | undefined> {
  return runInEtherInjectionContext(injectBalance, options, () =>
    toEtherSignal(inject(EtherWalletService).balance$, undefined)
  );
}
