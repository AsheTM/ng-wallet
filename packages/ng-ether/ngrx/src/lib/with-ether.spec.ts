import { TestBed } from '@angular/core/testing';
import { EtherTestingWallet, provideEtherTesting, TEtherTestingOptions } from '@ashetm/ng-ether';
import { signalStore } from '@ngrx/signals';
import { isError } from 'ethers';

import { TEtherStoreOptions, withEther } from './with-ether';

const me = '0x0000000000000000000000000000000000000001';
const other = '0x0000000000000000000000000000000000000002';

describe('withEther', () => {
  let wallet: EtherTestingWallet;
  const setUp = (testing?: TEtherTestingOptions, options?: TEtherStoreOptions) => {
    const WalletStore = signalStore({ providedIn: 'root' }, withEther(options));

    TestBed.configureTestingModule({ providers: [provideEtherTesting(testing)] });
    wallet = TestBed.inject(EtherTestingWallet);

    return TestBed.inject(WalletStore);
  };

  it('holds the wallet, the account and the network', async () => {
    const store = setUp({ accounts: [me], chainId: 11155111, balance: 10n ** 18n });

    await wallet.flush();

    expect(store.walletInstalled()).toBe(true);
    expect(store.isConnected()).toBe(true);
    expect(store.account()).toBe(me);
    expect(store.accounts()).toEqual([me]);
    expect(store.chainId()).toBe(11155111);
    expect(Number(store.network()?.chainId)).toBe(11155111);
    expect(store.balance()).toBe(10n ** 18n);
  });

  it('follows the wallet changes', async () => {
    const store = setUp({ accounts: [me] });

    await wallet.flush();
    wallet.setAccounts([other]);
    wallet.setChainId(137);
    await wallet.flush();

    expect(store.account()).toBe(other);
    expect(store.chainId()).toBe(137);
  });

  it('connects the wallet', async () => {
    const store = setUp({ connectAccounts: [me] });

    store.connect();

    expect(store.connecting()).toBe(true);

    await wallet.flush();

    expect(store.connecting()).toBe(false);
    expect(store.connectError()).toBeNull();
    expect(store.account()).toBe(me);
  });

  it('keeps the error of a rejected connection', async () => {
    const store = setUp();

    wallet.rejectNext('eth_requestAccounts');
    store.connect();
    await wallet.flush();

    expect(store.connecting()).toBe(false);
    expect(isError(store.connectError(), 'ACTION_REJECTED')).toBe(true);
    expect(store.isConnected()).toBe(false);
  });

  it('switches the network', async () => {
    const store = setUp({ accounts: [me] });

    await store.switchNetwork(11155111);
    await wallet.flush();

    expect(store.chainId()).toBe(11155111);
  });

  it('reads the balance, the price and the gas fee only when enabled', async () => {
    const store = setUp({ accounts: [me], balance: 5n }, { balance: false, gasFee: true });

    await wallet.flush();

    expect(store.balance()).toBeUndefined();
    expect(store.price()).toBeUndefined();
    expect(store.gasFee()).toBe(1_000_000_000n);
  });

  it('keeps the default values without wallet', async () => {
    const store = setUp({ wallet: false });

    await wallet.flush();

    expect(store.walletInstalled()).toBe(false);
    expect(store.isConnected()).toBe(false);
    expect(store.account()).toBeUndefined();
    expect(store.chainId()).toBeUndefined();
    expect(store.balance()).toBeUndefined();
  });
});
