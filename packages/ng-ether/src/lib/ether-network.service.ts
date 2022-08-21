import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMapTo, takeUntil } from 'rxjs/operators';

import { AEtherNetworkService } from './ether-network-service.class';
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
