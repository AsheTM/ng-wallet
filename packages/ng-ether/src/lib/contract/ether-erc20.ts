import { inject } from '@angular/core';
import { Contract, parseUnits, TransactionResponse } from 'ethers';
import {
  catchError,
  combineLatest,
  defer,
  distinctUntilChanged,
  EMPTY,
  from,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { runInEtherInjectionContext, TEtherInjectOptions } from '../core/ether-injection';
import { AEtherSigner } from '../core/ether-signer.class';
import { TEtherBigNumber } from '../core/ether.type';
import { EtherNetworkService } from '../network/ether-network.service';
import { TEtherNetwork } from '../network/ether-network.type';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { EtherWalletService } from '../wallet/ether-wallet.service';
import { fromContractEvent } from './ether-contract-event';

// The ERC-20 functions and events used by EtherErc20Token
export const ETHER_ERC20_ABI: readonly string[] = Object.freeze([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function approve(address spender, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);

// An amount in tokens ('1.5', converted with the decimals of the token), or a raw amount (bigint)
export type TEtherErc20Amount = string | bigint;

export class EtherErc20Token {
  readonly contract: Contract;

  readonly name$: Observable<string>;
  readonly symbol$: Observable<string>;
  readonly decimals$: Observable<number>;
  // Raw balance of the connected account, 0 when disconnected; refreshed on account and network change,
  // and on the Transfer events from or to the account
  readonly balance$: Observable<TEtherBigNumber>;

  constructor(
    readonly address: string,
    private readonly _signer: AEtherSigner | null,
    account$: Observable<string | undefined>,
    network$: Observable<TEtherNetwork>
  ) {
    this.contract = new Contract(address, ETHER_ERC20_ABI, _signer);
    // Read once, and read again only after an error
    this.name$ = this._read<string>('name').pipe(shareReplay(1));
    this.symbol$ = this._read<string>('symbol').pipe(shareReplay(1));
    this.decimals$ = this._read<bigint>('decimals').pipe(map(Number), shareReplay(1));
    this.balance$ = combineLatest([account$, network$]).pipe(
      switchMap(([account]: [string | undefined, TEtherNetwork]) =>
        account
          ? merge(
              of(null),
              this._transfers({ args: [account, null] }),
              this._transfers({ args: [null, account] })
            ).pipe(switchMap(() => this.balanceOf(account)))
          : of(0n)
      ),
      distinctUntilChanged()
    );
  }

  balanceOf(owner: string): Observable<TEtherBigNumber> {
    return this._read<bigint>('balanceOf', owner);
  }

  allowance(owner: string, spender: string): Observable<TEtherBigNumber> {
    return this._read<bigint>('allowance', owner, spender);
  }

  // Sent on subscription, like sendEth(): to use with trackTransaction() or injectTransaction().track()
  transfer(to: string, amount: TEtherErc20Amount): Observable<TransactionResponse> {
    return this._write('transfer', to, amount);
  }

  approve(spender: string, amount: TEtherErc20Amount): Observable<TransactionResponse> {
    return this._write('approve', spender, amount);
  }

  private _toRawAmount(amount: TEtherErc20Amount): Observable<bigint> {
    return typeof amount === 'bigint'
      ? of(amount)
      : this.decimals$.pipe(
          take(1),
          map((decimals: number) => parseUnits(amount, decimals))
        );
  }

  // The balance is still refreshed on account and network change if the events can not be followed
  private _transfers(filter: { args: unknown[] }): Observable<unknown> {
    return fromContractEvent(this.contract, 'Transfer', filter).pipe(catchError(() => EMPTY));
  }

  private _read<T>(method: string, ...args: unknown[]): Observable<T> {
    return this._requireWallet(() => from(this.contract[method](...args) as Promise<T>));
  }

  private _requireWallet<T>(source: () => Observable<T>): Observable<T> {
    return defer(() => (this._signer ? source() : throwError(() => new EtherWalletNotInstalledError())));
  }

  private _write(method: string, address: string, amount: TEtherErc20Amount): Observable<TransactionResponse> {
    return this._requireWallet(() =>
      this._toRawAmount(amount).pipe(
        switchMap((rawAmount: bigint) => from(this.contract[method](address, rawAmount) as Promise<TransactionResponse>))
      )
    );
  }
}

// An ERC-20 token at an address, read and sent with the wallet
export function injectErc20Token(address: string, options?: TEtherInjectOptions): EtherErc20Token {
  return runInEtherInjectionContext(injectErc20Token, options, () =>
    new EtherErc20Token(
      address,
      inject(AEtherSigner),
      inject(EtherWalletService).account$,
      inject(EtherNetworkService).network$
    )
  );
}
