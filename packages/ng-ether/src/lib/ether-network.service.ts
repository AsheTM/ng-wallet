import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { FeeData } from 'ethers';
import { from, interval, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import { AEtherNetworkService } from './ether-network-service.class';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import {
  TEtherNetwork,
  TEtherNetworkChange,
  TEtherNetworkInfoChainId,
} from './ether-network.type';
import { EEtherEventWallet } from './ether.enum';
import { TEtherBigNumber } from './ether.type';

@Injectable()
export class EtherNetworkService
  extends AEtherNetworkService
  implements OnDestroy
{
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
  readonly price$: Observable<number> = this._onAccountOrNetworkChange().pipe(
    switchMap((_: string[] | TEtherNetworkChange) =>
      this._aEtherProvider.getEtherPrice()
    )
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
