import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  CanMatchFn,
  Router,
  UrlTree,
} from '@angular/router';
import {
  EtherNetworkService,
  EtherWalletService,
  ETHER_TOKEN_IS_WALLET_INSTALLED,
  TEtherNetwork,
  TEtherNetworkInfoChainId,
  toHexChainId,
} from '@ashetm/ng-ether';
import { getAddress } from 'ethers';
import { catchError, map, Observable, of, switchMap, take } from 'rxjs';

// Usable in canActivate, canActivateChild and canMatch
export type TEtherGuard = CanActivateFn & CanActivateChildFn & CanMatchFn;

export type TEtherGuardOptions = {
  // Where to navigate when the guard blocks the route; without it, the navigation is only cancelled
  redirectTo?: string | UrlTree;
};

export type TEtherChainGuardOptions = TEtherGuardOptions & {
  // Asks the wallet to switch to the chain instead of blocking the route right away
  switchNetwork?: boolean;
};

function createGuard(
  check: () => Observable<boolean>,
  options?: TEtherGuardOptions
): TEtherGuard {
  return (() => {
    const router: Router = inject(Router);
    const block = (): boolean | UrlTree =>
      options?.redirectTo === undefined
        ? false
        : typeof options.redirectTo === 'string'
          ? router.parseUrl(options.redirectTo)
          : options.redirectTo;

    // Any error (no wallet installed, request rejected...) blocks the route
    return check().pipe(
      take(1),
      map((allowed: boolean) => allowed || block()),
      catchError(() => of(block()))
    );
  }) as TEtherGuard;
}

// Allows the route when a wallet is installed in the browser
export function requireWallet(options?: TEtherGuardOptions): TEtherGuard {
  return createGuard(() => of(inject(ETHER_TOKEN_IS_WALLET_INSTALLED)), options);
}

// Allows the route when the wallet is connected to the application
export function requireConnection(options?: TEtherGuardOptions): TEtherGuard {
  return createGuard(() => inject(EtherWalletService).onConnect(), options);
}

// Allows the route when the wallet is on the given chain
export function requireChain(
  chainId: TEtherNetworkInfoChainId,
  options?: TEtherChainGuardOptions
): TEtherGuard {
  let expectedChainId: bigint;

  try {
    expectedChainId = BigInt(toHexChainId(chainId));
  } catch {
    throw new Error(`Invalid chain ID: ${chainId}`);
  }

  return createGuard(() => {
    const networkService: EtherNetworkService = inject(EtherNetworkService);

    return networkService.network$.pipe(
      take(1),
      switchMap((network: TEtherNetwork) =>
        network.chainId === expectedChainId || !options?.switchNetwork
          ? of(network.chainId === expectedChainId)
          : networkService.switchNetwork(chainId)
      )
    );
  }, options);
}

// Allows the route when the connected account is one of the given addresses.
// This only improves the user experience: protect the data on the server or in the contract
export function requireAccount(
  addresses: readonly string[],
  options?: TEtherGuardOptions
): TEtherGuard {
  const allowedAddresses: ReadonlySet<string> = new Set(
    addresses.map((address: string) => getAddress(address))
  );

  return createGuard(
    () =>
      inject(EtherWalletService).account$.pipe(
        map(
          (account: string | undefined) =>
            !!account && allowedAddresses.has(getAddress(account))
        )
      ),
    options
  );
}
