import { Injector, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ETHER_TOKEN } from '../core/ether.token';
import { provideEther } from '../ether.providers';
import { EtherWalletNotInstalledError } from './ether-wallet-not-installed.error';
import { EtherWalletService } from './ether-wallet.service';
import { injectAccount, injectAccounts, injectBalance, injectIsConnected } from './ether-wallet.signal';

const account = '0x0000000000000000000000000000000000000001';

describe('ng-ether wallet signals', () => {
  let account$: Subject<string | undefined>;
  let accounts$: Subject<string[]>;
  let balance$: Subject<bigint>;
  let connect$: Subject<boolean>;

  beforeEach(() => {
    account$ = new Subject();
    accounts$ = new Subject();
    balance$ = new Subject();
    connect$ = new Subject();
    TestBed.configureTestingModule({
      providers: [{
        provide: EtherWalletService,
        useValue: { account$, balance$, onAccountChange: () => accounts$, onConnect: () => connect$ }
      }]
    });
  });

  it('starts with the default values', () => {
    TestBed.runInInjectionContext(() => {
      expect(injectAccount()()).toBeUndefined();
      expect(injectAccounts()()).toEqual([]);
      expect(injectIsConnected()()).toBe(false);
      expect(injectBalance()()).toBeUndefined();
    });
  });

  it('follows the values of the wallet', () => {
    const [accountSignal, accountsSignal, isConnectedSignal, balanceSignal] = TestBed.runInInjectionContext(
      () => [injectAccount(), injectAccounts(), injectIsConnected(), injectBalance()] as const
    );

    account$.next(account);
    accounts$.next([account]);
    connect$.next(true);
    balance$.next(10n ** 18n);

    expect(accountSignal()).toBe(account);
    expect(accountsSignal()).toEqual([account]);
    expect(isConnectedSignal()).toBe(true);
    expect(balanceSignal()).toBe(10n ** 18n);
  });

  it('keeps the default value instead of throwing on error', () => {
    const accountSignal: Signal<string | undefined> = TestBed.runInInjectionContext(() => injectAccount());

    account$.error(new EtherWalletNotInstalledError());

    expect(accountSignal()).toBeUndefined();
  });

  it('needs an injection context, or an injector', () => {
    expect(() => injectAccount()).toThrow();

    const accountSignal: Signal<string | undefined> = injectAccount({ injector: TestBed.inject(Injector) });

    account$.next(account);

    expect(accountSignal()).toBe(account);
  });
});

describe('ng-ether wallet signals without wallet', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideEther(), { provide: ETHER_TOKEN, useValue: undefined }]
    });
  });

  it('keep their default values', () => {
    TestBed.runInInjectionContext(() => {
      expect(injectAccount()()).toBeUndefined();
      expect(injectAccounts()()).toEqual([]);
      expect(injectIsConnected()()).toBe(false);
      expect(injectBalance()()).toBeUndefined();
    });
  });
});
