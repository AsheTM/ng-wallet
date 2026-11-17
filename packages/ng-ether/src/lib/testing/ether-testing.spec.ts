import { TestBed } from '@angular/core/testing';
import { isError } from 'ethers';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';

import { ETHER_TOKEN_IS_WALLET_INSTALLED } from '../core/ether.token';
import { EtherNetworkService } from '../network/ether-network.service';
import { trackTransaction } from '../transaction/ether-transaction.lifecycle';
import { EtherTransactionService } from '../transaction/ether-transaction.service';
import { injectChainId } from '../network/ether-network.signal';
import { injectAccount, injectBalance } from '../wallet/ether-wallet.signal';
import { injectWalletInfo } from '../wallet/ether-wallet-info';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { EtherWalletService } from '../wallet/ether-wallet.service';
import { EtherTestingWallet, provideEtherTesting, TEtherTestingOptions } from './ether-testing';

const me = '0x0000000000000000000000000000000000000001';
const other = '0x0000000000000000000000000000000000000002';

describe('provideEtherTesting', () => {
  let wallet: EtherTestingWallet;
  const setUp = (options?: TEtherTestingOptions): void => {
    TestBed.configureTestingModule({ providers: [provideEtherTesting(options)] });
    wallet = TestBed.inject(EtherTestingWallet);
  };

  it('starts disconnected on Ethereum mainnet with MetaMask', async () => {
    setUp();
    const walletService: EtherWalletService = TestBed.inject(EtherWalletService);

    expect(await firstValueFrom(walletService.onAccountChange())).toEqual([]);
    expect(Number((await firstValueFrom(TestBed.inject(EtherNetworkService).network$)).chainId)).toBe(1);
    expect(TestBed.runInInjectionContext(() => injectWalletInfo())()?.name).toBe('MetaMask');
  });

  it('follows the accounts, the chain and the balance set by the test, in signals too', async () => {
    setUp({ accounts: [me], chainId: 11155111, balance: 10n ** 18n });
    const [account, balance, chainId] = TestBed.runInInjectionContext(
      () => [injectAccount(), injectBalance(), injectChainId()] as const
    );

    await wallet.flush();

    expect(account()).toBe(me);
    expect(balance()).toBe(10n ** 18n);
    expect(chainId()).toBe(11155111);

    wallet.setAccounts([other]);
    wallet.setChainId(1);
    wallet.setBalance(2n * 10n ** 18n);
    await wallet.flush();

    expect(account()).toBe(other);
    expect(chainId()).toBe(1);
    expect(balance()).toBe(2n * 10n ** 18n);
  });

  it('connects the wallet, or rejects the connection like a user', async () => {
    setUp({ connectAccounts: [other] });
    const walletService: EtherWalletService = TestBed.inject(EtherWalletService);

    wallet.rejectNext('eth_requestAccounts');
    const rejection: unknown = await firstValueFrom(walletService.connectWallet()).catch((error) => error);

    expect(isError(rejection, 'ACTION_REJECTED')).toBe(true);
    expect(await firstValueFrom(walletService.connectWallet())).toEqual([other]);
  });

  it('sends a transaction, mined at once, and records the request', async () => {
    setUp({ accounts: [me] });
    const transfer = TestBed.inject(EtherTransactionService).prepareTransaction(other).sendEth(0.5);

    const states = await lastValueFrom(trackTransaction(transfer).pipe(toArray()));

    expect(states.map(({ status }) => status)).toEqual(['pending', 'submitted', 'confirmed']);
    expect(wallet.requests.find(({ method }) => method === 'eth_sendTransaction')?.params?.[0]).toEqual(
      expect.objectContaining({ to: other, value: '0x6f05b59d3b20000' })
    );
  });

  it('switches the network', async () => {
    setUp({ accounts: [me] });

    await firstValueFrom(TestBed.inject(EtherNetworkService).switchNetwork(11155111));
    await wallet.flush();

    expect(wallet.requests).toContainEqual({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }] });
    expect(Number((await firstValueFrom(TestBed.inject(EtherNetworkService).network$)).chainId)).toBe(11155111);
  });

  it('answers with the given responder', async () => {
    setUp();
    wallet.respond('eth_blockNumber', () => '0x2a');

    expect(await firstValueFrom(TestBed.inject(EtherNetworkService).blockNumber$)).toBe(42);
  });

  it('behaves as a browser without wallet with wallet: false', async () => {
    setUp({ wallet: false });

    expect(TestBed.inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).toBe(false);
    await expect(firstValueFrom(TestBed.inject(EtherWalletService).account$)).rejects.toBeInstanceOf(
      EtherWalletNotInstalledError
    );
  });

  it('names other wallets', () => {
    setUp({ wallet: 'Rabby' });

    expect(TestBed.runInInjectionContext(() => injectWalletInfo())()).toEqual({ name: 'Rabby', isMetaMask: false });
    expect(wallet.ethereum['isMetaMask']).toBe(true);
  });
});
