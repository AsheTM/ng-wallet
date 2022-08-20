import { Injectable, NgZone } from '@angular/core';
import { from, Observable, OperatorFunction, Subscriber, race } from 'rxjs';
import {
  filter,
  map,
  mapTo,
  shareReplay,
  switchMap,
  switchMapTo,
  take
} from 'rxjs/operators';

import { AEtherProvider } from './ether-provider.class';
import {
  TEtherBigNumber,
  TEtherNetwork,
  TEtherNetworkChange
} from './ether.type';


@Injectable()
export class EtherProviderService {

  accountChange$: Observable<string[]>
    = this._onAccountChange().pipe(filter((accounts: string[]) =>
      accounts.length !== 0));
  connect$: Observable<boolean>
    = this._onAccountChange()
      .pipe(map((accounts: string[]) => accounts.length !== 0));
  disconnect$: Observable<void>
    = this._onAccountChange().pipe(
      filter((accounts: string[]) => accounts.length === 0),
      mapTo(void 0)
    );
  networkChange$: Observable<TEtherNetworkChange>
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


  balance$: Observable<TEtherBigNumber>
    = this._onAccountOrNetworkChange().pipe(
      this._switchMapToAccount(0),
      switchMap((account: string) => this._aEtherProvider.getBalance(account))
    );
  blockNumber$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getBlockNumber()));
  gasFee$: Observable<TEtherBigNumber>
    = this._onAccountOrNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getGasPrice()));
  price$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getEtherPrice()));
  transactionCount$: Observable<number>
    = this._onAccountOrNetworkChange().pipe(
      this._switchMapToAccount(0),
      switchMap((account: string) =>
        this._aEtherProvider.getTransactionCount(account))
    );

  constructor(
    private readonly _ngZone: NgZone,
    private readonly _aEtherProvider: AEtherProvider
  ) { }

  connectWallet(): Observable<string[]> {
    return new Observable<string[]>((subscriber: Subscriber<string[]>) => {
      return from(this._aEtherProvider.send('eth_requestAccounts', []))
        .pipe(take(1))
        .subscribe({
          next: (accounts: string[]) => subscriber.next(accounts)
        });
    });
  }

  private _onAccountChange(): Observable<string[]> {
    return new Observable<string[]>((subscriber: Subscriber<string[]>) => {
      this._ngZone.run(() => (this._aEtherProvider as any).on('accountsChanged', subscriber.next));
    }).pipe(shareReplay(1));
  }

  private _onAccountOrNetworkChange(): Observable<string[] | TEtherNetworkChange> {
    return race(
      this.accountChange$,
      this.networkChange$
    );
  }

  private _switchMapToAccount<T> (index: number): OperatorFunction<T, string> {
    return (source: Observable<T>) => source.pipe(
      switchMapTo(this.accountChange$),
      map((accounts: string[]) => accounts[index]),
    );
  }

}
