import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMapTo, takeUntil } from 'rxjs/operators';

import { AEtherNetworkService } from './ether-network-service.class';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { TEtherBigNumber, TEtherNetwork, TEtherNetworkChange } from './ether.type';


@Injectable()
export class EtherNetworkService extends AEtherNetworkService implements OnDestroy {

  readonly blockNumber$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getBlockNumber()));
  readonly gasFee$: Observable<TEtherBigNumber>
    = this._onAccountOrNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getGasPrice()));
  readonly network$: Observable<TEtherNetwork>
    = this.onNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getNetwork()));
  readonly price$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMapTo(this._aEtherProvider.getEtherPrice()));

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

}
