import { inject } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, pairwise } from 'rxjs';

import {
  listenInEtherInjectionContext,
  runInEtherInjectionContext,
  TEtherInjectOptions,
} from '../core/ether-injection';
import { EtherWalletService } from './ether-wallet.service';

type TEtherConnection = { accounts: string[]; isConnected: boolean };

// Emits only when the wallet becomes connected or disconnected, not on each account change
function connectionChange(): Observable<TEtherConnection> {
  return inject(EtherWalletService)
    .onAccountChange()
    .pipe(
      map((accounts: string[]) => ({ accounts, isConnected: accounts.length !== 0 })),
      distinctUntilChanged(
        (previous: TEtherConnection, current: TEtherConnection) =>
          previous.isConnected === current.isConnected
      )
    );
}

// Calls fn with the accounts when the wallet connects, and right away if it is already connected
export function onWalletConnect(
  fn: (accounts: string[]) => void,
  options?: TEtherInjectOptions
): () => void {
  return runInEtherInjectionContext(onWalletConnect, options, () =>
    listenInEtherInjectionContext(
      connectionChange().pipe(
        filter(({ isConnected }: TEtherConnection) => isConnected),
        map(({ accounts }: TEtherConnection) => accounts)
      ),
      fn
    )
  );
}

// Calls fn when a connected wallet disconnects (not when it is disconnected from the start)
export function onWalletDisconnect(fn: () => void, options?: TEtherInjectOptions): () => void {
  return runInEtherInjectionContext(onWalletDisconnect, options, () =>
    listenInEtherInjectionContext(
      connectionChange().pipe(
        pairwise(),
        filter(
          ([previous, current]: [TEtherConnection, TEtherConnection]) =>
            previous.isConnected && !current.isConnected
        )
      ),
      () => fn()
    )
  );
}

// Calls fn with the accounts on each change, and right away with the current accounts
export function onAccountChange(
  fn: (accounts: string[]) => void,
  options?: TEtherInjectOptions
): () => void {
  return runInEtherInjectionContext(onAccountChange, options, () =>
    listenInEtherInjectionContext(inject(EtherWalletService).onAccountChange(), fn)
  );
}
