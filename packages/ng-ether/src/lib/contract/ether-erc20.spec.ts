import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Interface, Network, TransactionRequest } from 'ethers';
import { firstValueFrom, lastValueFrom, Subject, take, toArray } from 'rxjs';

import { AEtherSigner } from '../core/ether-signer.class';
import { ETHER_TOKEN } from '../core/ether.token';
import { provideEther } from '../ether.providers';
import { EtherNetworkService } from '../network/ether-network.service';
import { TEtherNetwork } from '../network/ether-network.type';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { EtherWalletService } from '../wallet/ether-wallet.service';
import { ETHER_ERC20_ABI, EtherErc20Token, injectErc20Token } from './ether-erc20';

const token = '0x00000000000000000000000000000000000000a0';
const account = '0x0000000000000000000000000000000000000001';
const spender = '0x0000000000000000000000000000000000000002';
const erc20: Interface = new Interface(ETHER_ERC20_ABI);

// Answers the ERC-20 calls like a token with 6 decimals, and records the sent transactions
function fakeSigner(balances: bigint[]) {
  const results: Record<string, unknown[]> = {
    name: ['USD Coin'],
    symbol: ['USDC'],
    decimals: [6],
    allowance: [100n],
  };

  return {
    provider: { on: async () => void 0, off: async () => void 0 },
    call: jest.fn(async ({ data }: TransactionRequest) => {
      const name = erc20.parseTransaction({ data: data ?? '0x' })?.name ?? '';

      return erc20.encodeFunctionResult(name, name === 'balanceOf' ? [balances.shift() ?? 0n] : results[name]);
    }),
    sendTransaction: jest.fn(async (transaction: TransactionRequest) => ({ ...transaction, hash: '0x01' })),
  };
}

describe('EtherErc20Token', () => {
  let account$: Subject<string | undefined>;
  let network$: Subject<TEtherNetwork>;
  let signer: ReturnType<typeof fakeSigner>;
  let usdc: EtherErc20Token;

  beforeEach(() => {
    account$ = new Subject();
    network$ = new Subject();
    signer = fakeSigner([1_500_000n, 2_000_000n]);
    TestBed.configureTestingModule({
      providers: [
        { provide: AEtherSigner, useValue: signer },
        { provide: EtherWalletService, useValue: { account$ } },
        { provide: EtherNetworkService, useValue: { network$ } },
      ],
    });
    usdc = TestBed.runInInjectionContext(() => injectErc20Token(token));
  });

  it('reads the name, the symbol and the decimals once', async () => {
    expect(await firstValueFrom(usdc.name$)).toBe('USD Coin');
    expect(await firstValueFrom(usdc.symbol$)).toBe('USDC');
    expect(await firstValueFrom(usdc.decimals$)).toBe(6);

    await firstValueFrom(usdc.decimals$);

    expect(signer.call).toHaveBeenCalledTimes(3);
  });

  it('reads balances and allowances', async () => {
    expect(await firstValueFrom(usdc.balanceOf(account))).toBe(1_500_000n);
    expect(await firstValueFrom(usdc.allowance(account, spender))).toBe(100n);
  });

  it('follows the balance of the connected account, 0 when disconnected', async () => {
    const balances = lastValueFrom(usdc.balance$.pipe(take(3), toArray()));

    account$.next(account);
    network$.next(Network.from(1));
    await new Promise((resolve) => setTimeout(resolve));
    network$.next(Network.from(11155111));
    await new Promise((resolve) => setTimeout(resolve));
    account$.next(undefined);

    expect(await balances).toEqual([1_500_000n, 2_000_000n, 0n]);
  });

  it('transfers an amount in tokens, converted with the decimals', async () => {
    const response = await firstValueFrom(usdc.transfer(spender, '1.5'));
    const [transaction] = signer.sendTransaction.mock.calls[0];

    expect(response.hash).toBe('0x01');
    expect(erc20.decodeFunctionData('transfer', transaction.data ?? '0x')).toEqual([spender, 1_500_000n]);
  });

  it('approves a raw amount', async () => {
    await firstValueFrom(usdc.approve(spender, 42n));
    const [transaction] = signer.sendTransaction.mock.calls[0];

    expect(erc20.decodeFunctionData('approve', transaction.data ?? '0x')).toEqual([spender, 42n]);
  });

  it('is sent on subscription only', () => {
    usdc.transfer(spender, 1n);

    expect(signer.sendTransaction).not.toHaveBeenCalled();
  });

  it('needs an injection context, or an injector', () => {
    expect(() => injectErc20Token(token)).toThrow();
    expect(injectErc20Token(token, { injector: TestBed.inject(Injector) }).address).toBe(token);
  });
});

describe('EtherErc20Token without wallet', () => {
  it('emits EtherWalletNotInstalledError', async () => {
    TestBed.configureTestingModule({
      providers: [provideEther(), { provide: ETHER_TOKEN, useValue: undefined }],
    });
    const usdc: EtherErc20Token = TestBed.runInInjectionContext(() => injectErc20Token(token));

    await expect(firstValueFrom(usdc.symbol$)).rejects.toBeInstanceOf(EtherWalletNotInstalledError);
    await expect(firstValueFrom(usdc.balance$)).rejects.toBeInstanceOf(EtherWalletNotInstalledError);
    await expect(firstValueFrom(usdc.transfer(account, '1'))).rejects.toBeInstanceOf(EtherWalletNotInstalledError);
  });
});
