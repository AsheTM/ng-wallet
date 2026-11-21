import { Injectable, OnDestroy } from '@angular/core';
import { EMPTY, from, Observable, Subject, timer } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';

import { AEtherWalletService } from './ether-wallet-service.class';
import { TEtherBigNumber } from '../core/ether.type';

@Injectable()
export class EtherWalletService
  extends AEtherWalletService
  implements OnDestroy
{
  readonly account$: Observable<string> = this._accountChange$.pipe(
    map(([account]: string[]) => account)
  );
  readonly balance$: Observable<TEtherBigNumber> =
    this._onAccountOrNetworkChange().pipe(
      this._switchMapToAccount(0),
      // Compared per account, so switching account always emits its balance.
      // Not read without connected account: the balance follows once connected
      switchMap((account: string | undefined) =>
        !account ? EMPTY : timer(0, 500).pipe(
          switchMap((_: number) =>
            from(this._aEtherProvider.getBalance(account))
          ),
          distinctUntilChanged()
        )
      )
    );
  readonly transactionCount$: Observable<number> =
    this._onAccountOrNetworkChange().pipe(
      this._switchMapToAccount(0),
      // Not read without connected account, like the balance
      switchMap((account: string | undefined) =>
        !account ? EMPTY : this._aEtherProvider.getTransactionCount(account)
      )
    );

  private readonly _destroySubject: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  // Emits the accounts and completes, or emits the wallet error (for example when the user rejects the connection)
  connectWallet(): Observable<string[]> {
    return this._requireWallet(() =>
      from(this._aEtherProvider.send('eth_requestAccounts', []) as Promise<string[]>)
    );
  }

  getBalanceOf(addressWallet: string): Observable<TEtherBigNumber> {
    return this._requireWallet(() =>
      from(this._aEtherProvider.getBalance(addressWallet))
    );
  }

  getTransactionCountOf(addressWallet: string): Observable<number> {
    return this._requireWallet(() =>
      from(this._aEtherProvider.getTransactionCount(addressWallet)).pipe(take(1))
    );
  }

  onAccountChange(): Observable<string[]>;
  onAccountChange(fn: (accounts: string[]) => void): void;
  onAccountChange(
    fn?: (accounts: string[]) => void
  ): Observable<string[]> | void {
    const onAccountChange$: Observable<string[]> = this._accountChange$;

    if (!fn) {
      return onAccountChange$;
    }

    onAccountChange$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: (accounts: string[]) => fn(accounts),
    });
  }

  onConnect(): Observable<boolean>;
  onConnect(fn: (isConnected: boolean) => void): void;
  onConnect(fn?: (isConnected: boolean) => void): Observable<boolean> | void {
    const onConnect$: Observable<boolean> = this._accountChange$.pipe(
      map((accounts: string[]) => accounts.length !== 0)
    );

    if (!fn) {
      return onConnect$;
    }

    onConnect$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: (isConnected: boolean) => fn(isConnected),
    });
  }

  onDisconnect(): Observable<void>;
  onDisconnect(fn: () => void): void;
  onDisconnect(fn?: () => void): Observable<void> | void {
    const onDisconnect$: Observable<void> = this._accountChange$.pipe(
      filter((accounts: string[]) => accounts.length === 0),
      map((_: string[]) => void 0)
    );

    if (!fn) {
      return onDisconnect$;
    }

    onDisconnect$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: () => fn(),
    });
  }
}
