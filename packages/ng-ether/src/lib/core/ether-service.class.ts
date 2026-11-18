import { inject, NgZone } from '@angular/core';
import { Network } from 'ethers';
import { defer, Observable, OperatorFunction, merge, Subscriber, throwError } from 'rxjs';
import {
  distinctUntilKeyChanged,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

import { TEtherNetwork, TEtherNetworkChange } from '../network/ether-network.type';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { ETHER_TOKEN } from './ether.token';

export abstract class AEtherService {
  protected readonly _ngZone: NgZone = inject(NgZone);
  protected readonly _aEtherProvider: AEtherProvider = inject(AEtherProvider);
  protected readonly _aEtherSigner: AEtherSigner = inject(AEtherSigner);
  // ethers v6 no longer exposes the injected wallet, so its events are listened to directly
  protected readonly _ethereum: any = inject(ETHER_TOKEN);

  protected readonly _accountChange$: Observable<string[]> = this._requireWallet(() => new Observable<
    string[]
  >((subscriber: Subscriber<string[]>) => {
    // The first read is ignored once a wallet event has arrived: its answer may arrive later, and is older
    let hasEvent = false;
    const onAccountsChanged = (accounts: string[]) => {
      this._ngZone.run(() => subscriber.next(accounts));
    };
    const onEvent = (accounts: string[]) => {
      hasEvent = true;
      onAccountsChanged(accounts);
    };

    this._aEtherProvider.send('eth_accounts', []).then(
      (accounts: string[]) => hasEvent || onAccountsChanged(accounts),
      (error: unknown) => hasEvent || subscriber.error(error)
    );
    this._ethereum.on('accountsChanged', onEvent);

    return () =>
      this._ethereum.removeListener('accountsChanged', onEvent);
  })).pipe(distinctUntilKeyChanged(0), shareReplay(1));
  protected readonly _networkChange$: Observable<TEtherNetworkChange> =
    this._requireWallet(() => new Observable<TEtherNetworkChange>(
      (subscriber: Subscriber<TEtherNetworkChange>) => {
        let oldNetwork: TEtherNetwork | undefined;
        // The first read is ignored once a wallet event has arrived, like the accounts
        let hasEvent = false;
        const onNetwork = (newNetwork: TEtherNetwork) => {
          this._ngZone.run(() => subscriber.next({ newNetwork, oldNetwork }));
          oldNetwork = newNetwork;
        };
        const onChainChanged = (chainId: string) => {
          hasEvent = true;
          onNetwork(Network.from(BigInt(chainId)));
        };

        this._aEtherProvider.getNetwork().then(
          (network: TEtherNetwork) => hasEvent || onNetwork(network),
          (error: unknown) => hasEvent || subscriber.error(error)
        );
        this._ethereum.on('chainChanged', onChainChanged);

        return () =>
          this._ethereum.removeListener('chainChanged', onChainChanged);
      }
    )).pipe(shareReplay(1));

  protected _onAccountOrNetworkChange(): Observable<
    string[] | TEtherNetworkChange
  > {
    return merge(this._accountChange$, this._networkChange$);
  }

  // Runs the source only when a wallet is installed, otherwise emits an EtherWalletNotInstalledError
  protected _requireWallet<T>(source: () => Observable<T>): Observable<T> {
    return defer(() =>
      this._ethereum && this._aEtherProvider
        ? source()
        : throwError(() => new EtherWalletNotInstalledError())
    );
  }

  protected _switchMapToAccount<T>(index: number): OperatorFunction<T, string> {
    return (source: Observable<T>) =>
      source.pipe(
        switchMap((_: T) => this._accountChange$),
        map((accounts: string[]) => accounts[index])
      );
  }
}
