import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { from, Observable, Subject, Subscriber } from 'rxjs';
import { filter, map, mapTo, pluck, switchMap, take, takeUntil } from 'rxjs/operators';

import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { AEtherWalletService } from './ether-wallet-service.class';
import { TEtherBigNumber } from './ether.type';


@Injectable()
export class EtherWalletService extends AEtherWalletService implements OnDestroy {

  readonly account$: Observable<string>
    = this._accountChange$.pipe(pluck('0'));
  readonly balance$: Observable<TEtherBigNumber>
    = this._onAccountOrNetworkChange().pipe(
      this._switchMapToAccount(0),
      switchMap((account: string) => this._aEtherProvider.getBalance(account))
    );
  readonly transactionCount$: Observable<number>
    = this._onAccountOrNetworkChange().pipe(
      this._switchMapToAccount(0),
      switchMap((account: string) =>
        this._aEtherProvider.getTransactionCount(account))
    );

  private readonly _destroySubject: Subject<void> = new Subject<void>();

  constructor(
    protected readonly _ngZone: NgZone,
    protected readonly _aEtherProvider: AEtherProvider,
    protected readonly _aEtherSigner: AEtherSigner
  ) {
    super(_ngZone, _aEtherProvider, _aEtherSigner);
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  connectWallet(): Observable<string[]> {
    return new Observable<string[]>((subscriber: Subscriber<string[]>) => {
      return from(this._aEtherProvider.send('eth_requestAccounts', []))
        .pipe(take(1))
        .subscribe({
          next: (accounts: string[]) => subscriber.next(accounts)
        });
    });
  }

  getBalanceOf(addressWallet: string): Observable<TEtherBigNumber> {
    return new Observable<TEtherBigNumber>((subscriber: Subscriber<TEtherBigNumber>) => {
      return from(this._aEtherProvider.getBalance(addressWallet))
        .pipe(take(1))
        .subscribe({
          next: (balance: TEtherBigNumber) => subscriber.next(balance)
        });
    });
  }

  getTransactionCountOf(addressWallet: string): Observable<number> {
    return from(this._aEtherProvider.getTransactionCount(addressWallet))
      .pipe(take(1));
  }

  onAccountChange(): Observable<string[]>;
  onAccountChange(fn: (accounts: string[]) => void): void;
  onAccountChange(fn?: (accounts: string[]) => void): Observable<string[]> | void {
    const onAccountChange$: Observable<string[]> = this._accountChange$;

    if(!fn) {
      return onAccountChange$;
    }

    onAccountChange$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: (accounts: string[]) => fn(accounts)
    });
  }

  onConnect(): Observable<boolean>;
  onConnect(fn: (isConnected: boolean) => void): void;
  onConnect(fn?: (isConnected: boolean) => void): Observable<boolean> | void {
    const onConnect$: Observable<boolean> = this._onAccountChange()
      .pipe(map((accounts: string[]) => accounts.length !== 0));

    if(!fn) {
      return onConnect$;
    }

    onConnect$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: (isConnected: boolean) => fn(isConnected)
    });
  }

  onDisconnect(): Observable<void>;
  onDisconnect(fn: () => void): void;
  onDisconnect(fn?: () => void): Observable<void> | void {
    const onDisconnect$: Observable<void> = this._onAccountChange().pipe(
      filter((accounts: string[]) => accounts.length === 0),
      mapTo(void 0)
    );

    if(!fn) {
      return onDisconnect$;
    }

    onDisconnect$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: () => fn()
    });
  }

}
