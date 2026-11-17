import { inject, Signal, signal } from '@angular/core';

import { runInEtherInjectionContext, TEtherInjectOptions } from '../core/ether-injection';
import { ETHER_TOKEN, ETHER_TOKEN_IS_WALLET_INSTALLED } from '../core/ether.token';

export type TEtherWalletInfo = {
  // Name of the wallet read from its flags, 'Unknown wallet' when no flag is known
  name: string;
  isMetaMask: boolean;
};

// Flags set by the wallets on window.ethereum, with their name. Several wallets also set isMetaMask
// to be compatible with MetaMask: their own flag is checked first
export const ETHER_WALLET_FLAGS: readonly (readonly [flag: string, name: string])[] = Object.freeze([
  ['isRabby', 'Rabby'],
  ['isBraveWallet', 'Brave Wallet'],
  ['isCoinbaseWallet', 'Coinbase Wallet'],
  ['isTrust', 'Trust Wallet'],
  ['isOkxWallet', 'OKX Wallet'],
  ['isPhantom', 'Phantom'],
  ['isMetaMask', 'MetaMask'],
] as const);

export function getEtherWalletInfo(ethereum: Record<string, unknown>): TEtherWalletInfo {
  const [, name] = ETHER_WALLET_FLAGS.find(([flag]: readonly [string, string]) => !!ethereum[flag]) ?? [
    '',
    'Unknown wallet',
  ];

  return { name, isMetaMask: name === 'MetaMask' };
}

// true if a wallet is installed in the browser, false without wallet and on the server
export function injectWalletInstalled(options?: TEtherInjectOptions): Signal<boolean> {
  return runInEtherInjectionContext(injectWalletInstalled, options, () =>
    signal(inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).asReadonly()
  );
}

// Information about the installed wallet, null without wallet and on the server
export function injectWalletInfo(options?: TEtherInjectOptions): Signal<TEtherWalletInfo | null> {
  return runInEtherInjectionContext(injectWalletInfo, options, () => {
    const ethereum = inject(ETHER_TOKEN);

    return signal(ethereum ? getEtherWalletInfo(ethereum) : null).asReadonly();
  });
}
