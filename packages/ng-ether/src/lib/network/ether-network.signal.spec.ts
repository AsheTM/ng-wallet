import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Network } from 'ethers';
import { defer, Observable, of, Subject, throwError } from 'rxjs';

import { ETHER_TOKEN } from '../core/ether.token';
import { provideEther } from '../ether.providers';
import { EtherNetworkService } from './ether-network.service';
import { injectChainId, injectGasFee, injectNetwork, injectPrice } from './ether-network.signal';
import { TEtherNetwork } from './ether-network.type';

describe('ng-ether network signals', () => {
  let gasFee$: Subject<bigint>;
  let network$: Subject<TEtherNetwork>;
  let prices: Observable<number>[];

  beforeEach(() => {
    gasFee$ = new Subject();
    network$ = new Subject();
    prices = [];
    TestBed.configureTestingModule({
      providers: [{
        provide: EtherNetworkService,
        // Each subscription to price$ reads the next price stream, like a new network does
        useValue: { gasFee$, network$, price$: defer(() => prices.shift() ?? of(0)) }
      }]
    });
  });

  it('starts with the default values', () => {
    TestBed.runInInjectionContext(() => {
      expect(injectNetwork()()).toBeUndefined();
      expect(injectChainId()()).toBeUndefined();
      expect(injectGasFee()()).toBeUndefined();
      expect(injectPrice()()).toBeUndefined();
    });
  });

  it('follows the network and the gas fee', () => {
    const [networkSignal, chainIdSignal, gasFeeSignal] = TestBed.runInInjectionContext(
      () => [injectNetwork(), injectChainId(), injectGasFee()] as const
    );
    const sepolia: TEtherNetwork = Network.from(11155111);

    network$.next(sepolia);
    gasFee$.next(1_000_000_000n);

    expect(networkSignal()).toBe(sepolia);
    expect(chainIdSignal()).toBe(11155111);
    expect(gasFeeSignal()).toBe(1_000_000_000n);
  });

  it('shows the price again after a chain without price feed', () => {
    const priceSignal: Signal<number | undefined> = TestBed.runInInjectionContext(() => injectPrice());

    prices.push(throwError(() => new Error('No price feed configured for chain 1337')), of(3124.57));
    network$.next(Network.from(1337));

    expect(priceSignal()).toBeUndefined();

    network$.next(Network.from(1));

    expect(priceSignal()).toBe(3124.57);
  });
});

describe('ng-ether network signals without wallet', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideEther(), { provide: ETHER_TOKEN, useValue: undefined }]
    });
  });

  it('keep their default values', () => {
    TestBed.runInInjectionContext(() => {
      expect(injectNetwork()()).toBeUndefined();
      expect(injectChainId()()).toBeUndefined();
      expect(injectGasFee()()).toBeUndefined();
      expect(injectPrice()()).toBeUndefined();
    });
  });
});
