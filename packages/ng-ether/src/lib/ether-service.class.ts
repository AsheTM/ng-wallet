import { NgZone } from '@angular/core';
import { Observable, OperatorFunction, race, Subscriber } from 'rxjs';
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators';

import { TEtherNetwork, TEtherNetworkChange } from './ether-network.type';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';


export abstract class AEtherService {

  protected readonly _accountChange$: Observable<string[]>
    = new Observable<string[]>((subscriber: Subscriber<string[]>) => {
      type TObjectOnEventAccountsChanged = Record<
        'on',
        (eventNetwork: 'accountsChanged', fn: (accounts: string[]) => void) => void
      >;

      this._ngZone.run(async () => {
        const firstListAccounts: string[] = await this._aEtherProvider.listAccounts();

        subscriber.next(firstListAccounts);
        (this._aEtherProvider as unknown as Record<'provider', TObjectOnEventAccountsChanged>).provider
          .on('accountsChanged', (accounts: string[]) => {
            subscriber.next(accounts);
          });
      });
    }).pipe(
      distinctUntilKeyChanged(0),
      shareReplay(1),
    );
  protected readonly _networkChange$: Observable<TEtherNetworkChange>
    = new Observable<TEtherNetworkChange>((
      subscriber: Subscriber<TEtherNetworkChange>
    ) => {
      type TObjectOnEventNetwork = Record<
        'on',
        (eventNetwork: 'network', fn: (
          newNetwork: TEtherNetwork,
          oldNetwork?: TEtherNetwork
        ) => void) => void
      >;

      this._ngZone.run(() => (this._aEtherProvider as TObjectOnEventNetwork).on('network', (
        newNetwork: TEtherNetwork,
        oldNetwork?: TEtherNetwork
      ) => {
        subscriber.next({
          newNetwork,
          oldNetwork
        })
      }));
    }).pipe(shareReplay(1));

  constructor(
    protected readonly _ngZone: NgZone,
    protected readonly _aEtherProvider: AEtherProvider,
    protected readonly _aEtherSigner: AEtherSigner
  ) { }

  protected _onAccountOrNetworkChange(): Observable<string[] | TEtherNetworkChange> {
    return race(
      this._accountChange$,
      this._networkChange$
    );
  }

  protected _switchMapToAccount<T> (index: number): OperatorFunction<T, string> {
    return (source: Observable<T>) => source.pipe(
      switchMap((_: T) => this._accountChange$),
      map((accounts: string[]) => accounts[index])
    );
  }

}
