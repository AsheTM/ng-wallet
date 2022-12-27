import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { AEtherNetworkService } from './ether-network-service.class';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { TEtherNetwork, TEtherNetworkChange, TEtherNetworkInfoChainId } from './ether-network.type';
import { EEtherEventWallet } from './ether.enum';
import { ETHER_TOKEN } from './ether.token';
import { TEtherBigNumber, TEtherError } from './ether.type';


@Injectable()
export class EtherNetworkService extends AEtherNetworkService implements OnDestroy {

  readonly blockNumber$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMap((_: string[] | TEtherNetworkChange) => this._aEtherProvider.getBlockNumber()));
  readonly gasFee$: Observable<TEtherBigNumber>
    = this._onAccountOrNetworkChange()
      .pipe(switchMap(() => interval(1000).pipe(
        switchMap((_: number) => this._aEtherProvider.getGasPrice()),
        distinctUntilChanged((
          previousValue: TEtherBigNumber,
          nextValue: TEtherBigNumber
        ) => previousValue.toString() === nextValue.toString())
      )));
  readonly network$: Observable<TEtherNetwork>
    = this.onNetworkChange()
      .pipe(switchMap((_: TEtherNetworkChange) => this._aEtherProvider.getNetwork()));
  readonly price$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMap((_: string[] | TEtherNetworkChange) => this._aEtherProvider.getEtherPrice()));

  private readonly _destroySubject: Subject<void> = new Subject<void>();

  constructor(
    @Inject(ETHER_TOKEN)
      private readonly _ethereum: any,
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

  addNetwork(newNetwork: TEtherNetwork): Observable<true | TEtherError> {
    const subject: Subject<true | TEtherError> = new ReplaySubject<true | TEtherError>(1);

    this._ethereum.request({
      method: EEtherEventWallet.ADD_ETHEREUM_CHAIN,
      params: [newNetwork]
    }).then(() => {
      subject.next(true);
    }).catch(subject.error);

    return subject.asObservable();
  }

  onNetworkChange(): Observable<TEtherNetworkChange>;
  onNetworkChange(fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void): void;
  onNetworkChange(fn?: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void): void | Observable<TEtherNetworkChange> {
    if(!fn) {
      return this._networkChange$;
    }

    this._networkChange$.pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: ({
          newNetwork,
          oldNetwork
        }: TEtherNetworkChange) => fn(newNetwork, oldNetwork)
      });
  }

  switchNetwork(chainId: TEtherNetworkInfoChainId): Observable<true | TEtherError> {
    const subject: Subject<true | TEtherError> = new ReplaySubject<true | TEtherError>(1);

    this._ethereum.request({
      method: EEtherEventWallet.SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: `${chainId}`.startsWith('0x') ? chainId : `0x${chainId}` }]
    }).then(() => {
      subject.next(true);
    }).catch(subject.error);

    return subject.asObservable();
  }

}
