import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ETHER_TOKEN, EEtherNetworkChainId, provideEther } from '@ashetm/ng-ether';

import {
  requireAccount,
  requireChain,
  requireConnection,
  requireWallet,
  TEtherGuard,
} from './ether.guard';

@Component({ template: 'page' })
class PageComponent {}

const account = '0x0000000000000000000000000000000000000001';

type TWallet = {
  accounts: string[];
  chainId: string;
  switchNetwork: jest.Mock;
};

describe('ng-ether router guards', () => {
  let wallet: TWallet;
  let walletInstalled: boolean;

  // Navigates to /guarded and returns the URL the router ended on
  const navigate = async (guard: TEtherGuard, guardType: 'canActivate' | 'canMatch' = 'canActivate'): Promise<string> => {
    const routes: Routes = [
      { path: '', component: PageComponent },
      { path: 'guarded', component: PageComponent, [guardType]: [guard] },
      { path: 'blocked', component: PageComponent },
    ];

    TestBed.configureTestingModule({
      providers: [
        provideEther(),
        provideRouter(routes),
        {
          provide: ETHER_TOKEN,
          // Like window.ethereum: undefined in a browser without wallet
          useFactory: () => !walletInstalled ? undefined : {
            on: () => void 0,
            removeListener: () => void 0,
            request: ({ method }: { method: string }) => {
              switch (method) {
                case 'eth_accounts':
                  return Promise.resolve(wallet.accounts);
                case 'eth_chainId':
                  return Promise.resolve(wallet.chainId);
                case 'wallet_switchEthereumChain':
                  return wallet.switchNetwork();
                default:
                  return Promise.resolve(null);
              }
            },
          },
        },
      ],
    });

    const harness: RouterTestingHarness = await RouterTestingHarness.create('/');

    await harness.navigateByUrl('/guarded');

    return TestBed.inject(Router).url;
  };

  beforeEach(() => {
    walletInstalled = true;
    wallet = {
      accounts: [account],
      chainId: '0x1',
      switchNetwork: jest.fn(() => Promise.resolve(null)),
    };
  });

  describe('requireWallet', () => {
    it('allows the route when a wallet is installed', async () => {
      expect(await navigate(requireWallet())).toBe('/guarded');
    });

    it('cancels the navigation without wallet', async () => {
      walletInstalled = false;

      expect(await navigate(requireWallet())).toBe('/');
    });

    it('redirects without wallet when redirectTo is given', async () => {
      walletInstalled = false;

      expect(await navigate(requireWallet({ redirectTo: '/blocked' }))).toBe('/blocked');
    });
  });

  describe('requireConnection', () => {
    it('allows the route when the wallet is connected', async () => {
      expect(await navigate(requireConnection())).toBe('/guarded');
    });

    it('redirects when the wallet is not connected', async () => {
      wallet.accounts = [];

      expect(await navigate(requireConnection({ redirectTo: '/blocked' }))).toBe('/blocked');
    });

    it('redirects without wallet', async () => {
      walletInstalled = false;

      expect(await navigate(requireConnection({ redirectTo: '/blocked' }))).toBe('/blocked');
    });

    it('works as a canMatch guard', async () => {
      wallet.accounts = [];

      expect(await navigate(requireConnection({ redirectTo: '/blocked' }), 'canMatch')).toBe('/blocked');
    });
  });

  describe('requireChain', () => {
    it('allows the route on the expected chain', async () => {
      expect(await navigate(requireChain(EEtherNetworkChainId.MAIN))).toBe('/guarded');
    });

    it('redirects on another chain', async () => {
      expect(await navigate(requireChain(EEtherNetworkChainId.SEPOLIA, { redirectTo: '/blocked' }))).toBe('/blocked');
      expect(wallet.switchNetwork).not.toHaveBeenCalled();
    });

    it('asks the wallet to switch chain when switchNetwork is set', async () => {
      expect(await navigate(requireChain('0xaa36a7', { switchNetwork: true }))).toBe('/guarded');
      expect(wallet.switchNetwork).toHaveBeenCalled();
    });

    it('redirects when the user rejects the chain switch', async () => {
      wallet.switchNetwork.mockImplementation(() => Promise.reject({ code: 4001, message: 'User rejected the request.' }));

      expect(await navigate(requireChain(11155111, { switchNetwork: true, redirectTo: '/blocked' }))).toBe('/blocked');
    });

    it('throws on an invalid chain ID', () => {
      expect(() => requireChain('mainnet')).toThrow('Invalid chain ID: mainnet');
    });
  });

  describe('requireAccount', () => {
    it('allows an account of the list, whatever its letter case', async () => {
      expect(await navigate(requireAccount([account.toUpperCase().replace('0X', '0x')]))).toBe('/guarded');
    });

    it('redirects another account', async () => {
      expect(await navigate(requireAccount(['0x0000000000000000000000000000000000000002'], { redirectTo: '/blocked' }))).toBe('/blocked');
    });

    it('redirects when the wallet is not connected', async () => {
      wallet.accounts = [];

      expect(await navigate(requireAccount([account], { redirectTo: '/blocked' }))).toBe('/blocked');
    });

    it('throws on an invalid address', () => {
      expect(() => requireAccount(['0x123'])).toThrow();
    });
  });
});
