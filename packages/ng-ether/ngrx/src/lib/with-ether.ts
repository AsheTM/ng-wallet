import { DestroyRef, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EtherNetworkService,
  EtherWalletService,
  injectAccount,
  injectAccounts,
  injectBalance,
  injectChainId,
  injectGasFee,
  injectIsConnected,
  injectNetwork,
  injectPrice,
  injectWalletInstalled,
  TEtherBigNumber,
  TEtherNetworkInfoChainId,
} from '@ashetm/ng-ether';
import { patchState, signalStoreFeature, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, take } from 'rxjs';

export type TEtherStoreOptions = {
  // Balance of the connected account, true by default
  balance?: boolean;
  // Price of the native currency in USD, false by default (polled every minute)
  price?: boolean;
  // Gas price, false by default (polled every second)
  gasFee?: boolean;
};

export type TEtherStoreState = {
  // true while the wallet asks the user to connect
  connecting: boolean;
  // Error of the last connection, null after a successful one
  connectError: unknown;
};

const disabled = <T>(): Signal<T | undefined> => signal<T | undefined>(undefined).asReadonly();

// The wallet and the network in a SignalStore: signals of @ashetm/ng-ether, and connect() / switchNetwork().
// Without wallet, or on the server, the signals keep their default values
export function withEther(options: TEtherStoreOptions = {}) {
  return signalStoreFeature(
    withState<TEtherStoreState>({ connecting: false, connectError: null }),
    withComputed(() => ({
      account: injectAccount(),
      accounts: injectAccounts(),
      isConnected: injectIsConnected(),
      chainId: injectChainId(),
      network: injectNetwork(),
      walletInstalled: injectWalletInstalled(),
      balance: options.balance === false ? disabled<TEtherBigNumber>() : injectBalance(),
      price: options.price ? injectPrice() : disabled<number>(),
      gasFee: options.gasFee ? injectGasFee() : disabled<TEtherBigNumber>(),
    })),
    withMethods((store) => {
      const destroyRef: DestroyRef = inject(DestroyRef);
      const networkService: EtherNetworkService = inject(EtherNetworkService);
      const walletService: EtherWalletService = inject(EtherWalletService);

      return {
        // Asks the wallet to connect; the result is in connecting and connectError, the accounts in account
        connect(): void {
          patchState(store, { connecting: true, connectError: null });
          walletService
            .connectWallet()
            .pipe(take(1), takeUntilDestroyed(destroyRef))
            .subscribe({
              next: () => patchState(store, { connecting: false }),
              error: (connectError: unknown) => patchState(store, { connecting: false, connectError }),
            });
        },
        // Resolves once the wallet has switched (chainId then follows), rejects with the wallet error
        async switchNetwork(chainId: TEtherNetworkInfoChainId): Promise<void> {
          await firstValueFrom(networkService.switchNetwork(chainId));
        },
      };
    })
  );
}
