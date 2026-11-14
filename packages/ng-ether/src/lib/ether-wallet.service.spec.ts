import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom, Observable, Subscription } from 'rxjs';

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

describe('EtherWalletService one-shot requests', () => {
  const account = '0x0000000000000000000000000000000000000001';
  let rejectConnection = false;
  let service: EtherWalletService;
  let provider: AEtherProvider;

  beforeEach(() => {
    rejectConnection = false;
    TestBed.configureTestingModule({
      imports: [EtherTestModule],
      providers: [{
        provide: ETHER_TOKEN,
        useValue: {
          on: () => void 0,
          removeListener: () => void 0,
          request: ({ method }: { method: string }) => {
            if (method === 'eth_requestAccounts' && rejectConnection) {
              return Promise.reject({ code: 4001, message: 'User rejected the request.' });
            }

            return Promise.resolve(method === 'eth_chainId' ? '0x1' : [account]);
          }
        }
      }]
    });
    service = TestBed.inject(EtherWalletService);
    provider = TestBed.inject(AEtherProvider);
  });

  afterEach(() => jest.restoreAllMocks());

  it('connectWallet() emits the accounts and completes', async () => {
    await expect(lastValueFrom(service.connectWallet())).resolves.toEqual([account]);
  });

  it('connectWallet() emits an error when the user rejects the connection', async () => {
    rejectConnection = true;

    // ethers converts the wallet error 4001 to its ACTION_REJECTED error
    await expect(firstValueFrom(service.connectWallet())).rejects.toMatchObject({ code: 'ACTION_REJECTED' });
  }, 1000);

  it('getBalanceOf() emits the balance and completes', async () => {
    jest.spyOn(provider, 'getBalance').mockResolvedValue(5n);

    await expect(lastValueFrom(service.getBalanceOf(account))).resolves.toBe(5n);
  }, 1000);

  it('getBalanceOf() emits an error when the request fails', async () => {
    jest.spyOn(provider, 'getBalance').mockRejectedValue(new Error('RPC failure'));

    await expect(firstValueFrom(service.getBalanceOf(account))).rejects.toThrow('RPC failure');
  }, 1000);
});
