import { TestBed } from '@angular/core/testing';
import { Observable, Subscription } from 'rxjs';

import { AEtherProvider } from './ether-provider.class';
import { EtherTestModule } from './ether-test.module';
import { EtherWalletService } from './ether-wallet.service';
import { ETHER_TOKEN } from './ether.token';
import { TEtherBigNumber } from './ether.type';


describe('EtherWalletService', () => {
  let service: EtherWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule]
    });
    service = TestBed.inject(EtherWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have account$', () => {
    expect(service.account$).toBeDefined();
  });

  it('should have balance$', () => {
    expect(service.balance$).toBeDefined();
  });

  it('should have transactionCount$', () => {
    expect(service.transactionCount$).toBeDefined();
  });

  it('should have connectWallet', () => {
    expect(service.connectWallet).toBeDefined();
  });

  it('should have getBalanceOf', () => {
    expect(service.getBalanceOf).toBeDefined();
  });

  it('should have onAccountChange', () => {
    expect(service.onAccountChange).toBeDefined();
    expect(service.onAccountChange()).toBeInstanceOf(Observable);
    expect(service.onAccountChange(() => null)).toBeUndefined();
  });

  it('should have onConnect', () => {
    expect(service.onConnect).toBeDefined();
    expect(service.onConnect()).toBeInstanceOf(Observable);
    expect(service.onConnect(() => null)).toBeUndefined();
  });

  it('should have onDisconnect', () => {
    expect(service.onDisconnect).toBeDefined();
    expect(service.onDisconnect()).toBeInstanceOf(Observable);
    expect(service.onDisconnect(() => null)).toBeUndefined();
  });
});

describe('EtherWalletService balance$', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('only emits when the balance changes', async () => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [EtherTestModule],
      providers: [{
        provide: ETHER_TOKEN,
        useValue: {
          on: () => void 0,
          removeListener: () => void 0,
          request: ({ method }: { method: string }) =>
            Promise.resolve(method === 'eth_accounts' ? ['0x0000000000000000000000000000000000000001'] : '0x1')
        }
      }]
    });
    const provider: AEtherProvider = TestBed.inject(AEtherProvider);
    const balances: TEtherBigNumber[] = [1n, 1n, 2n, 2n, 1n];
    const emitted: TEtherBigNumber[] = [];

    jest.spyOn(provider, 'getBalance').mockImplementation(() => Promise.resolve(balances.shift() ?? 1n));

    const subscription: Subscription = TestBed.inject(EtherWalletService).balance$
      .subscribe((balance: TEtherBigNumber) => emitted.push(balance));

    // 5 polls, every 500 ms
    await jest.advanceTimersByTimeAsync(2100);
    subscription.unsubscribe();

    expect(emitted).toEqual([1n, 2n, 1n]);
  });
});
