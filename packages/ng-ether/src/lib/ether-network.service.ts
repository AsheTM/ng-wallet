import { inject, Injectable, OnDestroy } from '@angular/core';
import { Contract, FeeData, formatUnits } from 'ethers';
import { from, interval, Observable, Subject, throwError, timer } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import { AEtherNetworkService } from './ether-network-service.class';
import {
  TEtherNetwork,
  TEtherNetworkChange,
  TEtherNetworkInfoChainId,
} from './ether-network.type';
import { ETHER_PRICE_FEED_ABI } from './ether-price-feed.constant';
import { EEtherEventWallet } from './ether.enum';
import { ETHER_TOKEN_PRICE_FEED } from './ether.token';
import { TEtherBigNumber, TEtherPriceFeed } from './ether.type';

@Injectable()
export class EtherNetworkService
  extends AEtherNetworkService
  implements OnDestroy
{
  private readonly _priceFeed: Readonly<TEtherPriceFeed> = inject(ETHER_TOKEN_PRICE_FEED);

  readonly blockNumber$: Observable<number> =
    this._onAccountOrNetworkChange().pipe(
      switchMap((_: string[] | TEtherNetworkChange) =>
        this._aEtherProvider.getBlockNumber()
      )
    );
  readonly gasFee$: Observable<TEtherBigNumber> =
    this._onAccountOrNetworkChange().pipe(
      switchMap(() =>
        interval(1000).pipe(
          switchMap((_: number) => this._aEtherProvider.getFeeData()),
          map(({ gasPrice }: FeeData) => gasPrice),
          filter((gasPrice: TEtherBigNumber | null): gasPrice is TEtherBigNumber =>
            gasPrice !== null
          ),
          distinctUntilChanged()
        )
      )
    );
  readonly network$: Observable<TEtherNetwork> = this.onNetworkChange().pipe(
    map(({ newNetwork }: TEtherNetworkChange) => newNetwork)
  );
  // Price in USD read from the Chainlink price feed of the current chain, refreshed every minute
  // (Chainlink updates its feeds on a 0.5% deviation or every hour, so polling faster is wasted calls)
  readonly price$: Observable<number> = this.onNetworkChange().pipe(
    switchMap(({ newNetwork }: TEtherNetworkChange) => {
      const chainId = Number(newNetwork.chainId);
      const address: `0x${string}` | undefined = this._priceFeed[chainId];

      if (!address) {
        return throwError(
          () => new Error(`No price feed configured for chain ${chainId}`)
        );
      }

      const priceFeed: Contract = new Contract(
        address,
        ETHER_PRICE_FEED_ABI,
        this._aEtherProvider
      );

      return timer(0, 60_000).pipe(
        switchMap((_: number) =>
          Promise.all([
            priceFeed['decimals']() as Promise<bigint>,
            priceFeed['latestRoundData']() as Promise<[bigint, bigint]>,
          ])
        ),
        map(([decimals, [, answer]]: [bigint, [bigint, bigint]]) =>
          Number(formatUnits(answer, decimals))
        ),
        distinctUntilChanged()
      );
    })
  );

  private readonly _destroySubject: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  addNetwork(newNetwork: TEtherNetwork): Observable<true> {
    return from(
      this._ethereum.request({
        method: EEtherEventWallet.ADD_ETHEREUM_CHAIN,
        params: [newNetwork],
      })
    ).pipe(map(() => true));
  }

  onNetworkChange(): Observable<TEtherNetworkChange>;
  onNetworkChange(
    fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void
  ): void;
  onNetworkChange(
    fn?: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void
  ): void | Observable<TEtherNetworkChange> {
    if (!fn) {
      return this._networkChange$;
    }

    this._networkChange$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: ({ newNetwork, oldNetwork }: TEtherNetworkChange) =>
        fn(newNetwork, oldNetwork),
    });
  }

  switchNetwork(chainId: TEtherNetworkInfoChainId): Observable<true> {
    return from(
      this._ethereum.request({
        method: EEtherEventWallet.SWITCH_ETHEREUM_CHAIN,
        params: [
          { chainId: `${chainId}`.startsWith('0x') ? chainId : `0x${chainId}` },
        ],
      })
    ).pipe(map(() => true));
  }
}
