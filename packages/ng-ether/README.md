# @ashetm/ng-ether

``@ashetm/ng-ether`` is a library that simplifies the use of ``ethers`` in Angular, with services based on ``RxJS`` streams to follow the wallet, the network and your own smart contract. It also provides route guards, and a test module that mocks ``window.ethereum`` (see below) for testing purposes.

<!-- [![build status](http://img.shields.io/travis/likeastore/ngDialog.svg)](https://travis-ci.org/likeastore/ngDialog) -->
<!-- [![npm version](http://badge.fury.io/js/ng-dialog.svg)](http://badge.fury.io/js/ng-dialog) -->
<!-- [![github tag](https://img.shields.io/github/tag/likeastore/ngDialog.svg)](https://github.com/likeastore/ngDialog/tags) -->
<!-- [![Download Count](https://img.shields.io/npm/dm/ng-dialog.svg)](http://www.npmjs.com/package/ng-dialog) -->
<!-- [![Code Climate](https://codeclimate.com/github/likeastore/ngDialog/badges/gpa.svg)](https://codeclimate.com/github/likeastore/ngDialog) -->


<!-- ### [Demo](http://likeastore.github.io/ngDialog) -->

## Compatibility

Since ``16.x``, one version of ``@ashetm/ng-ether`` supports a range of Angular versions, its major version is the minimum Angular version supported.

| @ashetm/ng-ether | Angular        | ethers |
| ---------------- | -------------- | ------ |
| ``20.x``         | 20             | 6.x    |
| ``16.x``         | 16, 17, 18, 19 | 5.x    |
| ``15.x``         | 15             | 5.x    |
| ``14.x``         | 14             | 5.x    |
| ``13.x``         | 13             | 5.x    |
| ``12.x``         | 12             | 5.x    |

Since ``20.x``, the services and the pipe also work with zoneless change detection (``provideZonelessChangeDetection()``), and with server-side rendering.

Upgrading from ``16.x``? Follow the [migration guide](https://github.com/AsheTM/ng-wallet/blob/main/packages/ng-ether/MIGRATION.md).

## Install

You can install it with npm:

```bash
npm install @ashetm/ng-ether
```

Or for a specific version of Angular, by using the matching version from the compatibility table above:

```bash
# Angular 16, 17, 18 or 19
npm install @ashetm/ng-ether@16
```

``ethers`` is installed with the library. ``@angular/router`` is only needed for the route guards (see below).

## Import

Add ``provideEther()`` to the providers of your application:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideEther } from '@ashetm/ng-ether';

export const appConfig: ApplicationConfig = {
  providers: [
    provideEther({
      abi: [...], // ABI of your deployed smart contract
      addressContract: '0x...', // Address of your deployed smart contract
      networkId: 'any', // Optional, default value is 'any'
      priceFeed: { 137: '0x...' } // Optional, Chainlink price feed address per chain ID, used by price$
    })
  ]
};
```

The configuration is optional: without it, ``provideEther()`` provides the services, the wallet and the network, but no smart contract (``AEtherContract``).

Then import ``EtherContractFnAsyncPipe`` in the components that use the pipe (see below).

### With NgModule

``EtherModule.forRoot()`` is still available for module based applications, with the same configuration, but it is **deprecated**: use ``provideEther()`` instead. It will be removed in the next major version.

```ts
import { EtherModule } from '@ashetm/ng-ether';

@NgModule({
  imports: [
    EtherModule.forRoot({ abi: [...], addressContract: '0x...' })
  ]
})
export class AppModule { }
```

## API

``@ashetm/ng-ether`` exposes the following: 

### Providers and modules

1. ``provideEther(configuration?)`` returns the providers of the library, with the ``TEtherConfigurationRoot`` configuration: ABI and address of a deployed smart contract, optional network ID and optional price feeds
1. ``EtherModule``, **deprecated**, with the ``forRoot(configuration?)`` static method, that adds ``provideEther(configuration)`` and exports ``EtherContractFnAsyncPipe``
1. ``EtherTestModule``, that provides a mock of ``window.ethereum`` through ``ETHER_TOKEN`` (see below) for testing purposes

### Tokens

Tokens are ``InjectionToken<T>`` that need to be injected in order to get their value

1. ``ETHER_TOKEN`` returns the ``window.ethereum`` object, if you wish a direct manipulation. It is ``undefined`` without wallet, and on the server with server-side rendering
2. ``ETHER_TOKEN_ABI`` returns the ``abi`` provided in the configuration
3. ``ETHER_TOKEN_ADDRESS_CONTRACT`` returns the ``addressContract`` provided in the configuration
4. ``ETHER_TOKEN_IS_METAMASK_WALLET`` returns boolean, true if MetaMask wallet is installed in browser
5. ``ETHER_TOKEN_IS_WALLET_INSTALLED`` returns boolean, true if the wallet is installed in browser
6. ``ETHER_TOKEN_NETWORK_ID`` returns the ``networkId`` provided in the configuration, default value is ``any``
7. ``ETHER_TOKEN_PRICE_FEED`` returns the Chainlink price feed address per chain ID used by ``price$``: the default ones (``ETHER_DEFAULT_PRICE_FEED``, Ethereum mainnet and Sepolia) with the ``priceFeed`` of the configuration

### Enums

``EEtherNetworkChainId`` lists the chain IDs of common networks:

* ``MAIN`` (``1``): Ethereum mainnet
* ``SEPOLIA`` (``11155111``): testnet for applications and tooling
* ``HOODI`` (``560048``): testnet for validators and staking providers, replacing Holesky
* ``LOCALHOST`` (``1337``): local development network

Deprecated, as these testnets are shut down, and to be removed in the next major version:

* ``ROPSTAN`` (``3``): shut down in 2022, after The Merge. Use ``SEPOLIA``
* ``RINKEBY`` (``4``): stopped working after The Merge in 2022, shut down in 2023. Use ``SEPOLIA``
* ``GOERLI`` (``5``): deprecated in 2023, shut down in 2024. Use ``SEPOLIA`` or ``HOODI``
* ``KOVAN`` (``42``): stopped working after The Merge in 2022. Use ``SEPOLIA``

### Services

#### EtherNetworkService

``EtherNetworkService`` is a service concern all about network.

* ``network$`` is ``Observable<TEtherNetwork>``, it emits ``TEtherNetwork`` value of network information

Those following are ``Observable`` and emits when account or network change

* ``blockNumber$`` is ``Observable<number>`` that emits a ``number`` value of number of block
* ``gasFee$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns gas price of the current network. It is checked every second, and only emitted when it changes
* ``price$`` is ``Observable<number>``, it emits ``number`` value of price of ETH in USD, read from the [Chainlink price feed](https://docs.chain.link/data-feeds/price-feeds/addresses) of the current network. It is refreshed every minute and when the network changes. Ethereum mainnet and Sepolia feeds are provided by default (``ETHER_DEFAULT_PRICE_FEED``); add or override feeds per chain ID with the ``priceFeed`` configuration. On a network without a feed, it emits an error ``No price feed configured for chain <chainId>``, and the stream completes: resubscribe (for example with ``retry``) to follow the next network

And for methods, there is the following: 

* ``addNetwork(newNetwork: TEtherNetworkInfo)`` returns ``Observable<true>`` listen to if a new network is added successfully to the wallet and emits ``true`` if success. ``TEtherNetworkInfo`` describes the network as expected by the wallet ([EIP-3085](https://eips.ethereum.org/EIPS/eip-3085)): ``chainId``, ``chainName``, ``nativeCurrency``, ``rpcUrls``, and optionally ``blockExplorerUrls`` and ``iconUrls``. ``chainId`` can be a number, a decimal string or a hexadecimal string, it is sent as a hexadecimal string.

* ``onNetworkChange()`` returns ``Observable<TEtherNetworkChange>`` listen to network change event and emits ``TEtherNetworkChange = { newNetwork: TEtherNetwork; oldNetwork?: TEtherNetwork; }`` value that contains informations of new network and old network.

or the second definition

* ``onNetworkChange(fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void)`` returns ``void`` nothing, you need to provide a function with 2 arguments; first argument is information of new network and second is information of old network.

* ``switchNetwork(chainId: TEtherNetworkInfoChainId)`` returns ``Observable<true>`` listen to if the switch to a specified network is done successfully and emits ``true`` if success. ``chainId`` can be a number, a decimal string or a hexadecimal string, like ``EEtherNetworkChainId.MAIN``, ``'1'`` or ``'0x1'``.

#### EtherTransactionService

``EtherTransactionService`` is a service concern all about transaction.

For methods, there is the following: 

* ``prepareTransaction(addressWallet: string)`` returns ``EtherTransactionRef`` that contains 4 methods: ``sendEth(amount: number)``, ``sendGWei(amount: number)``, ``sendKWei(amount: number)`` and ``sendWei(amount: number)`` that you specify amount to send with its appropriate unit; each of one returns ``Observable<TEtherTransactionResponse>``. It launches the transaction after subscribing to the observable, from the connected account and on the current network.

#### EtherWalletService

``EtherWalletService`` is a service concern all about wallet.

* ``account$`` is ``Observable<string>`` that emits the address wallet of the connected account
* ``balance$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns balance of the connected wallet. The balance is checked every 500 ms and only emitted when it changes, or when the account or network changes
* ``transactionCount$`` is ``Observable<number>``, it emits ``number`` value of transaction count

And for methods, there is the following: 

* ``connectWallet()`` returns ``Observable<string[]>`` tries to connect the current wallet and returns the current connected wallet in array, then completes. It emits an ethers error when the connection fails, for example with code ``ACTION_REJECTED`` when the user rejects it (check it with ``isError(error, 'ACTION_REJECTED')`` from ``ethers``)
* ``getBalanceOf(addressWallet: string)`` is ``Observable<TEtherBigNumber>`` that emits balance information of the provided address wallet, then completes. It emits an error when the request fails
* ``getTransactionCountOf(addressWallet: string)`` is ``Observable<number>`` that emits transaction count of the provided address wallet

And listeners event, there is the following with 2 definitions each: 

* ``onAccountChange()`` returns ``Observable<string[]>`` that emits list of wallet connected, if for example we switch from an account/address wallet to another one.

Or with second definition

* ``onAccountChange(fn: (accounts: string[]) => void)`` returns ``void``, you need to provide a callback function with 1 arguments of account/address wallet list, it does emit list of wallet connected, if for example we switch from an account/address wallet to another one.

* ``onConnect()`` returns ``Observable<boolean>`` that emits ``true`` if wallet is connected, ``false`` if not

Or with second definition

* ``onConnect(fn: (isConnected: boolean) => void)`` returns ``void``, you need to provide a callback function with 1 arguments of boolean value is account connected or not; ``true`` if wallet is connected, ``false`` if not

* ``onDisconnect()`` returns ``Observable<void>`` that emits a ``void`` value if wallet has disconnected

Or with second definition

* ``onDisconnect(fn: () => void)`` returns ``void``, you need to provide a callback function without arguments; that emits a ``void`` value if wallet has disconnected

**Note**: the callback definitions stay subscribed until the service is destroyed, so with the application. Prefer the ``Observable`` definitions in components, and unsubscribe (for example with ``takeUntilDestroyed()``).

### Classes

#### AEtherContract

``AEtherContract`` is an abstract class and a token to inject, it gives you an instance of ethers ``Contract`` for the smart contract of the configuration, connected to the wallet signer.

**Note**: This abstract class is available if the ``TEtherConfigurationRoot`` configuration is provided.

#### AEtherProvider

``AEtherProvider`` is an abstract class and a token to inject, it gives you an instance of ethers ``BrowserProvider`` connected to the wallet, or ``null`` without wallet.

#### AEtherSigner

``AEtherSigner`` is an abstract class and a token to inject, it gives you an instance of ``EtherSigner``, or ``null`` without wallet. ``EtherSigner`` is an ethers signer that always uses the account currently selected in the wallet, so it follows account changes and works before the wallet is connected.

#### ACustomContract

``ACustomContract`` is an abstract class to implement with your own custom smart contract call or transaction method, with ``Observable`` as return type. It has a super protected member called ``contract`` that gives you access to the deployed smart contract of the configuration.

#### EtherWalletNotInstalledError

``EtherWalletNotInstalledError`` is the error emitted by the services when no wallet is installed (see below).

### Decorators

#### ContractInjectable

``ContractInjectable`` is a class decorator, it must annotate a class that extends ``ACustomContract``. It has no parameter, the annotated class is provided in root with the deployed smart contract of the configuration, with ``provideEther()`` or ``EtherModule.forRoot()``.

### Pipes

#### etherContractFnAsync

``etherContractFnAsync`` is a standalone pipe that calls a method of your custom contract (class extending ``ACustomContract``) and subscribes to its result, like ``async`` pipe. Import ``EtherContractFnAsyncPipe`` in your component.

Pass the custom contract, then the method name. Any extra pipe arguments are passed to the method as one array:

```html
<p>{{ customContract | etherContractFnAsync: 'test' }}</p>
<p>{{ customContract | etherContractFnAsync: 'balanceOf' : address }}</p>
```

```ts
balanceOf(args: any[]): Observable<bigint> {
  return from(this.contract['balanceOf'](...args));
}
```

The method name, the arguments and the result are typed from your custom contract: type the array parameter as a tuple, like ``args: [owner: string]``, to have the arguments checked in the template.

The method is called again only when the contract, the method name or one of the arguments changes. Arguments are compared by reference, so pass component fields rather than object or array literals written in the template, which would call the method on every change detection.

### Route guards

The guards are in the ``@ashetm/ng-ether/router`` entry point, which needs ``@angular/router``. It is an optional peer dependency: applications that do not import ``@ashetm/ng-ether/router`` do not need it.

Each guard can be used in ``canActivate``, ``canActivateChild`` or ``canMatch``. When it blocks the route, the navigation is cancelled, or redirected with the ``redirectTo`` option. Any error, like a browser without wallet, blocks the route.

* ``requireWallet(options?)`` allows the route when a wallet is installed in the browser
* ``requireConnection(options?)`` allows the route when the wallet is connected
* ``requireChain(chainId, options?)`` allows the route when the wallet is on the given chain. With ``switchNetwork: true``, it asks the wallet to switch to that chain first, and blocks the route if the user rejects it. It throws on an invalid chain ID
* ``requireAccount(addresses, options?)`` allows the route when the connected account is one of the given addresses, whatever their letter case. It throws on an invalid address. Like every check in the browser, it only improves the user experience: protect the data on the server or in the contract

```ts
import { Routes } from '@angular/router';
import { EEtherNetworkChainId } from '@ashetm/ng-ether';
import { requireChain, requireConnection } from '@ashetm/ng-ether/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [
      requireConnection({ redirectTo: '/connect' }),
      requireChain(EEtherNetworkChainId.MAIN, { switchNetwork: true, redirectTo: '/wrong-network' })
    ],
    loadComponent: () => import('./dashboard.component')
  }
];
```

### Utils

Functions to format a ``TEtherBigNumber`` value to a string in the specified unit:

* ``formatEther(value)``
* ``formatGwei(value)``
* ``formatMwei(value)``
* ``formatKwei(value)``
* ``formatWei(value)``

And ``toHexChainId(chainId)``, that converts a chain ID (number, decimal string or hexadecimal string) to the hexadecimal string expected by wallets, like ``toHexChainId(137)`` that returns ``'0x89'``.

``TEtherBigNumber`` is the native ``bigint`` since ``20.x``.

## Usage

### Use own deployed smart contract

You can interact with your custom deployed contract, like in the example below:

```ts
import { Component, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ACustomContract, ContractInjectable, EtherContractFnAsyncPipe } from '@ashetm/ng-ether';

@ContractInjectable() // Compulsory, to annotate it
export class CustomContract extends ACustomContract { // Compulsory, extends ACustomContract

  decimals(): Observable<bigint> {
    return from(this.contract['decimals']() as Promise<bigint>);
  }

  balanceOf([owner]: [owner: string]): Observable<bigint> {
    return from(this.contract['balanceOf'](owner) as Promise<bigint>);
  }

}

@Component({
  imports: [EtherContractFnAsyncPipe],
  template: `{{ customContract | etherContractFnAsync: 'balanceOf' : owner }}`
})
export class BalanceComponent {
  readonly customContract = inject(CustomContract);
  readonly owner = '0x...';
}
```

### Handle a browser without wallet

Without an installed wallet (no ``window.ethereum``), the application starts normally, but every stream and method of ``EtherNetworkService``, ``EtherTransactionService`` and ``EtherWalletService`` emits an ``EtherWalletNotInstalledError`` (``No wallet installed``). With server-side rendering (Angular SSR), the server behaves the same way, as it has no ``window``: the wallet is only available once the application runs in the browser.

Check ``ETHER_TOKEN_IS_WALLET_INSTALLED`` before using them, or catch the error:

```ts
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { ETHER_TOKEN_IS_WALLET_INSTALLED, EtherWalletNotInstalledError, EtherWalletService } from '@ashetm/ng-ether';

readonly isWalletInstalled = inject(ETHER_TOKEN_IS_WALLET_INSTALLED); // Show an "Install a wallet" message when false

readonly account$ = inject(EtherWalletService).account$.pipe(
  catchError((error: unknown) => error instanceof EtherWalletNotInstalledError ? EMPTY : throwError(() => error))
);
```

### Test

Import ``EtherTestModule`` in your tests: it provides the library with a mock of ``window.ethereum`` through ``ETHER_TOKEN``. Override ``ETHER_TOKEN`` to return the accounts, chain or errors your test needs.

## Issue

LOOKING FOR MAINTAINER OR IF THERE IS AN ISSUE OR ANY IDEA TO ADD. PLEASE CREATE ISSUE IN GITHUB REPOSITORY.
