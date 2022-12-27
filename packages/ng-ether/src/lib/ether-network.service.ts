import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { AEtherNetworkService } from './ether-network-service.class';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { TEtherBigNumber, TEtherNetwork, TEtherNetworkChange } from './ether.type';


@Injectable()
export class EtherNetworkService extends AEtherNetworkService implements OnDestroy {

  readonly blockNumber$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMap(() =>this._aEtherProvider.getBlockNumber()));
  readonly gasFee$: Observable<TEtherBigNumber>
    = this._onAccountOrNetworkChange()
      .pipe(switchMap(() => this._aEtherProvider.getGasPrice()));
  readonly network$: Observable<TEtherNetwork>
    = this.onNetworkChange()
      .pipe(switchMap(() => this._aEtherProvider.getNetwork()));
  readonly price$: Observable<number>
    = this._onAccountOrNetworkChange()
      .pipe(switchMap(() => this._aEtherProvider.getEtherPrice()));

  private readonly _destroySubject: Subject<void> = new Subject<void>();

  constructor() {
    super(inject(NgZone), inject(AEtherProvider), inject(AEtherSigner));
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
