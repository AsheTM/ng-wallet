import { NgZone } from '@angular/core';
import { Observable, OperatorFunction, race, Subscriber } from 'rxjs';
import { filter, map, shareReplay, switchMapTo } from 'rxjs/operators';

import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { TEtherNetwork, TEtherNetworkChange } from './ether.type';


export abstract class AEtherService {

  protected readonly _accountChange$: Observable<string[]>
    = this._onAccountChange().pipe(filter((accounts: string[]) => accounts.length !== 0));
  protected readonly _networkChange$: Observable<TEtherNetworkChange>
    = new Observable<TEtherNetworkChange>((
      subscriber: Subscriber<TEtherNetworkChange>
    ) => {
      this._ngZone.run(() => (this._aEtherProvider as any).on('network', (
        newNetwork: TEtherNetwork,
        oldNetwork?: TEtherNetwork
      ) => {
        subscriber.next({
          newNetwork,
          oldNetwork
        })
      }));
    });

  constructor(
    protected readonly _ngZone: NgZone,
    protected readonly _aEtherProvider: AEtherProvider,
    protected readonly _aEtherSigner: AEtherSigner
  ) { }

  protected _onAccountChange(): Observable<string[]> {
    return new Observable<string[]>((subscriber: Subscriber<string[]>) => {
      this._ngZone.run(() => (this._aEtherProvider as any).on('accountsChanged', subscriber.next));
    }).pipe(shareReplay(1));
  }

  protected _onAccountOrNetworkChange(): Observable<string[] | TEtherNetworkChange> {
    return race(
      this._accountChange$,
      this._networkChange$
    );
  }

  protected _switchMapToAccount<T> (index: number): OperatorFunction<T, string> {
    return (source: Observable<T>) => source.pipe(
      switchMapTo(this._accountChange$),
      map((accounts: string[]) => accounts[index])
    );
  }

}
