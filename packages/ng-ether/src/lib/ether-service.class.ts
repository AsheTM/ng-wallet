import { inject, NgZone } from '@angular/core';
import { Network } from 'ethers';
import { Observable, OperatorFunction, merge, Subscriber } from 'rxjs';
import {
  distinctUntilKeyChanged,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

import { TEtherNetwork, TEtherNetworkChange } from './ether-network.type';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { ETHER_TOKEN } from './ether.token';

export abstract class AEtherService {
  protected readonly _ngZone: NgZone = inject(NgZone);
  protected readonly _aEtherProvider: AEtherProvider = inject(AEtherProvider);
  protected readonly _aEtherSigner: AEtherSigner = inject(AEtherSigner);
  // ethers v6 no longer exposes the injected wallet, so its events are listened to directly
  protected readonly _ethereum: any = inject(ETHER_TOKEN);

  protected readonly _accountChange$: Observable<string[]> = new Observable<
    string[]
  >((subscriber: Subscriber<string[]>) => {
    const onAccountsChanged = (accounts: string[]) => {
      this._ngZone.run(() => subscriber.next(accounts));
    };

    this._aEtherProvider
      .send('eth_accounts', [])
      .then(onAccountsChanged, (error: unknown) => subscriber.error(error));
    this._ethereum.on('accountsChanged', onAccountsChanged);

    return () =>
      this._ethereum.removeListener('accountsChanged', onAccountsChanged);
  }).pipe(distinctUntilKeyChanged(0), shareReplay(1));
  protected readonly _networkChange$: Observable<TEtherNetworkChange> =
    new Observable<TEtherNetworkChange>(
      (subscriber: Subscriber<TEtherNetworkChange>) => {
        let oldNetwork: TEtherNetwork | undefined;
        const onNetwork = (newNetwork: TEtherNetwork) => {
          this._ngZone.run(() => subscriber.next({ newNetwork, oldNetwork }));
          oldNetwork = newNetwork;
        };
        const onChainChanged = (chainId: string) => {
          onNetwork(Network.from(BigInt(chainId)));
        };

        this._aEtherProvider
          .getNetwork()
          .then(onNetwork, (error: unknown) => subscriber.error(error));
        this._ethereum.on('chainChanged', onChainChanged);

        return () =>
          this._ethereum.removeListener('chainChanged', onChainChanged);
      }
    ).pipe(shareReplay(1));

  protected _onAccountOrNetworkChange(): Observable<
    string[] | TEtherNetworkChange
  > {
    return merge(this._accountChange$, this._networkChange$);
  }

  protected _switchMapToAccount<T>(index: number): OperatorFunction<T, string> {
    return (source: Observable<T>) =>
      source.pipe(
        switchMap((_: T) => this._accountChange$),
        map((accounts: string[]) => accounts[index])
      );
  }
}
