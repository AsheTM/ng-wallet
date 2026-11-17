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
| ``20.x``         | 20 and later   | 6.x    |
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
# Angular 20 and later
npm install @ashetm/ng-ether@20

# Angular 16, 17, 18 or 19
npm install @ashetm/ng-ether@16
```

``ethers``, ``@ashetm/platform`` and ``@ashetm/types`` (types only, it adds nothing to your bundle) are installed with the library. ``@angular/router`` is only needed for the route guards, and ``@ngrx/signals`` for the SignalStore features (see below).

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
      priceFeed: { 137: '0x...' }, // Optional, Chainlink price feed address per chain ID, used by price$
      explorers: { 137: 'https://polygonscan.com' } // Optional, block explorer per chain ID, used by etherExplorerLink
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

1. ``ETHER_TOKEN`` returns the ``window.ethereum`` object, if you wish a direct manipulation. It is ``undefined`` without wallet, on the server with server-side rendering, and wherever ``window`` does not exist (a web worker, a test without DOM), checked with ``isBrowser()`` from ``@ashetm/platform``
2. ``ETHER_TOKEN_ABI`` returns the ``abi`` provided in the configuration
3. ``ETHER_TOKEN_ADDRESS_CONTRACT`` returns the ``addressContract`` provided in the configuration
4. ``ETHER_TOKEN_IS_METAMASK_WALLET`` returns boolean, true if MetaMask wallet is installed in browser
5. ``ETHER_TOKEN_IS_WALLET_INSTALLED`` returns boolean, true if the wallet is installed in browser
6. ``ETHER_TOKEN_NETWORK_ID`` returns the ``networkId`` provided in the configuration, default value is ``any``
7. ``ETHER_TOKEN_PRICE_FEED`` returns the Chainlink price feed address per chain ID used by ``price$``: the default ones (``ETHER_DEFAULT_PRICE_FEED``, Ethereum mainnet and Sepolia) with the ``priceFeed`` of the configuration
8. ``ETHER_TOKEN_EXPLORER`` returns the block explorer per chain ID used by ``etherExplorerLink``: the default ones (``ETHER_DEFAULT_EXPLORER``, Etherscan for Ethereum mainnet, Sepolia and Hoodi) with the ``explorers`` of the configuration

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

* ``network$`` is ``Observable<TEtherNetwork>``, it emits ``TEtherNetwork`` value of network information. It reads the network once, then follows the ``chainChanged`` events of the wallet: a network switched during this first read is kept

Those following are ``Observable`` and emits when account or network change

* ``blockNumber$`` is ``Observable<number>`` that emits a ``number`` value of number of block
* ``gasFee$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns gas price of the current network. It is read at once, then checked every second, and only emitted when it changes
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

* ``account$`` is ``Observable<string>`` that emits the address wallet of the connected account. It reads the accounts once, then follows the ``accountsChanged`` events of the wallet: an account connected during this first read (for example right when the page loads) is kept
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

**Note**: the callback definitions stay subscribed until the service is destroyed, so with the application. In components, prefer the hooks (see below), or the ``Observable`` definitions and unsubscribe (for example with ``takeUntilDestroyed()``).

### Signals

Signal functions read the wallet and the network as signals. Call them in an injection context (a field initializer or a constructor), or pass an ``injector`` (for example in ``ngOnInit``).

| Function | Signal | Default value |
| -------- | ------ | ------------- |
| ``injectAccount()`` | Selected account | ``undefined`` |
| ``injectAccounts()`` | Connected accounts | ``[]`` |
| ``injectIsConnected()`` | ``true`` if an account is connected | ``false`` |
| ``injectBalance()`` | Balance of the selected account, in wei | ``undefined`` |
| ``injectNetwork()`` | Current network | ``undefined`` |
| ``injectChainId()`` | Chain ID of the current network | ``undefined`` |
| ``injectGasFee()`` | Gas price, in wei | ``undefined`` |
| ``injectPrice()`` | Price of the native currency in USD (see ``price$``) | ``undefined`` |
| ``injectWalletInstalled()`` | ``true`` if a wallet is installed in the browser | ``false`` on the server |
| ``injectWalletInfo()`` | ``TEtherWalletInfo`` of the installed wallet: ``name`` (MetaMask, Rabby, Coinbase Wallet…) and ``isMetaMask`` | ``null`` |

A signal can not hold an error: without wallet, on the server, or on error, it keeps its default value. ``injectPrice()`` is ``undefined`` on a chain without price feed, and is read again on each network change.

```ts
@Component({
  template: `
    @if (isConnected()) {
      <p>{{ account() }}: {{ balance() }} wei on chain {{ chainId() }}</p>
    }
  `
})
export class WalletComponent {
  readonly account = injectAccount();
  readonly balance = injectBalance();
  readonly chainId = injectChainId();
  readonly isConnected = injectIsConnected();

  // Outside an injection context
  private readonly _injector = inject(Injector);

  ngOnInit(): void {
    const price = injectPrice({ injector: this._injector });
  }
}
```

### Hooks

Hook functions call a callback on wallet and network events. Like the signals, call them in an injection context, or pass an ``injector``. They stop when their injection context is destroyed (for example the component), and return a function to stop earlier. Without wallet, or on the server, they are never called.

* ``onWalletConnect(fn: (accounts: string[]) => void)`` calls ``fn`` when the wallet connects, and right away if it is already connected. It is not called again on account changes
* ``onWalletDisconnect(fn: () => void)`` calls ``fn`` when a connected wallet disconnects. It is not called if the wallet is disconnected from the start
* ``onAccountChange(fn: (accounts: string[]) => void)`` calls ``fn`` on each account change, and right away with the current accounts
* ``onNetworkChange(fn: (change: TEtherNetworkChange) => void)`` calls ``fn`` on each network change with ``newNetwork`` and ``oldNetwork``, and right away with the current network

```ts
@Component({ ... })
export class WalletComponent {
  constructor() {
    onWalletConnect((accounts: string[]) => console.log('Connected', accounts));
    onWalletDisconnect(() => console.log('Disconnected'));
    onNetworkChange(({ newNetwork }: TEtherNetworkChange) => console.log('Chain', newNetwork.chainId));

    const stop = onAccountChange((accounts: string[]) => console.log('Accounts', accounts));
    // stop() to stop listening before the component is destroyed
  }
}
```

### Transactions

``trackTransaction(source, options?)`` follows a transfer or a contract call, and returns an ``Observable<TEtherTransactionState>`` that emits its states, then completes:

| ``status`` | Meaning | Other fields |
| ---------- | ------- | ------------ |
| ``'pending'`` | Waiting for the wallet signature | |
| ``'submitted'`` | Sent, waiting to be mined | ``hash`` |
| ``'confirmed'`` | Mined, with the given confirmations | ``hash``, ``receipt`` |
| ``'failed'`` | Rejected by the user or the wallet (without ``hash``), or reverted (with ``hash``) | ``error``, ``hash?`` |

A failure is a state, not an ``Observable`` error. ``source`` is an ``Observable<TransactionResponse>`` (like ``sendEth()``), or a function returning a ``Promise`` or an ``Observable`` of it (like a contract call), called on subscription. ``options.confirmations`` is the number of blocks to wait for before ``'confirmed'``: ``1`` by default, ``0`` completes once ``'submitted'``.

```ts
// Transfer
trackTransaction(transactionService.prepareTransaction(to).sendEth(0.1)).subscribe(
  (state: TEtherTransactionState) => console.log(state.status)
);

// Contract call
trackTransaction(() => contract['transfer'](to, amount), { confirmations: 2 });
```

In a component, ``injectTransaction()`` tracks a transaction as a signal. Call it in an injection context, or pass an ``injector``. It returns:

* ``state``, a ``Signal<TEtherTransactionState | undefined>``, ``undefined`` before the first ``track()``
* ``track(source, options?)``, that tracks a transaction like ``trackTransaction()``, and stops tracking the previous one
* ``reset()``, that stops tracking and sets ``state`` back to ``undefined``

The tracking also stops when the injection context is destroyed (for example the component). Stopping the tracking does not cancel a transaction already sent.

```ts
@Component({
  template: `
    <button (click)="send()" [disabled]="transaction.state()?.status === 'pending'">Send</button>
    @switch (transaction.state()?.status) {
      @case ('submitted') { <p>Waiting for the confirmation…</p> }
      @case ('confirmed') { <p>Confirmed</p> }
      @case ('failed') { <p>Failed</p> }
    }
  `
})
export class SendComponent {
  readonly transaction = injectTransaction();
  private readonly _contract = inject(AEtherContract);

  send(): void {
    this.transaction.track(() => this._contract['transfer'](to, amount));
  }
}
```

### Contract events

These functions follow the events of a smart contract, from an ethers ``Contract`` (for example ``AEtherContract``, or the ``contract`` of a custom contract). Each event is a ``TEtherContractEvent``: ``name``, ``args`` (by index and by name, ``event.args['from']``), ``blockNumber``, ``transactionHash`` and the ethers ``log``.

* ``fromContractEvent(contract, eventName, { args? })`` returns an ``Observable<TEtherContractEvent>`` of the new events. The listener is removed on unsubscription
* ``queryContractEvents(contract, eventName, { fromBlock?, toBlock?, args? })`` returns an ``Observable<TEtherContractEvent[]>`` of the past events. ``fromBlock`` can be negative to count back from the latest block
* ``onContractEvent(contract, eventName, fn, { args? })`` calls ``fn`` on each new event, like the hooks: in an injection context, stopped when it is destroyed, and returns a function to stop earlier

``args`` filters on the values of the indexed arguments, ``null`` to match any value: ``{ args: [null, me] }`` for the ``Transfer(from, to, value)`` events received by ``me``.

Without wallet, ``fromContractEvent`` and ``queryContractEvents`` emit an ``EtherWalletNotInstalledError``, and the ``fn`` of ``onContractEvent`` is never called.

```ts
private readonly _contract = inject(AEtherContract);

constructor() {
  // Transfers received by an address
  onContractEvent(this._contract, 'Transfer', (event: TEtherContractEvent) => console.log(event.args['value']), {
    args: [null, address]
  });
}

readonly lastTransfers$ = queryContractEvents(this._contract, 'Transfer', { fromBlock: -1000 });
```

### ERC-20 tokens

``injectErc20Token(address)`` returns an ``EtherErc20Token``, to read and send an ERC-20 token with the wallet. Call it in an injection context, or pass an ``injector``.

* ``name$``, ``symbol$`` and ``decimals$`` are read once
* ``balance$`` is the raw balance of the connected account, ``0n`` when disconnected. It is refreshed on account and network change, and on the ``Transfer`` events from or to the account
* ``balanceOf(owner)`` and ``allowance(owner, spender)`` return a raw amount (``bigint``)
* ``transfer(to, amount)`` and ``approve(spender, amount)`` take an amount in tokens (``'1.5'``, converted with the decimals of the token) or a raw ``bigint``. They return an ``Observable<TransactionResponse>``, sent on subscription: use them with ``trackTransaction()`` or ``injectTransaction().track()``
* ``contract`` is the ethers ``Contract`` of the token (``ETHER_ERC20_ABI``), for example for ``fromContractEvent()``

Without wallet, they emit an ``EtherWalletNotInstalledError``.

```ts
@Component({
  imports: [AsyncPipe, EtherUnitsPipe],
  template: `
    <p>{{ usdc.balance$ | async | etherUnits: 6 }} {{ usdc.symbol$ | async }}</p>
    <button (click)="send()">Send 1.5 USDC</button>
  `
})
export class UsdcComponent {
  readonly usdc = injectErc20Token('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  readonly transaction = injectTransaction();

  send(): void {
    this.transaction.track(this.usdc.transfer(to, '1.5'));
  }
}
```

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

#### etherShortAddress

``address | etherShortAddress : start? : end?`` shortens an address, keeping ``start`` characters at the start (``0x`` included, 6 by default) and ``end`` at the end (4 by default).

```html
{{ account() | etherShortAddress }}        <!-- 0x1234…abcd -->
{{ account() | etherShortAddress: 4 : 2 }} <!-- 0x12…cd -->
```

#### etherUnits

``value | etherUnits : unit? : maxDecimals?`` formats a wei amount in a unit (``'ether'`` by default, ``'gwei'``, ``'wei'``…) or a number of decimals (for example ``6`` for USDC). ``maxDecimals`` truncates, so a balance is never rounded up, and the trailing zeros are removed.

```html
{{ balance() | etherUnits }}            <!-- 1.5 -->
{{ gasFee() | etherUnits: 'gwei' : 2 }} <!-- 12.34 -->
{{ usdcBalance | etherUnits: 6 }}       <!-- 2.5 -->
```

#### etherExplorerLink

``value | etherExplorerLink : chainId : type?`` returns the URL of an address, a transaction or a block on the block explorer of the chain. The type is detected from the value: an address (42 characters), a transaction hash (66 characters) or a block number. Pass ``'token'`` (or ``'address'``, ``'tx'``, ``'block'``) as ``type`` to choose it.

Etherscan is used by default for Ethereum mainnet, Sepolia and Hoodi (``ETHER_DEFAULT_EXPLORER``). Add or override explorers per chain ID with the ``explorers`` configuration. On a chain without explorer, it returns ``null``, and an ``[href]`` bound to ``null`` renders no link.

```html
<a [href]="account() | etherExplorerLink: chainId()">Account</a>
<a [href]="hash | etherExplorerLink: chainId()">Transaction</a>
<a [href]="tokenAddress | etherExplorerLink: chainId() : 'token'">Token</a>
```

#### etherChainName

``chainId | etherChainName`` returns the name of a chain from its ID (number, ``bigint`` or hexadecimal string): Ethereum, Sepolia, Hoodi, Polygon, Base, Arbitrum One… An unknown chain is named ``Chain <chainId>``.

```html
{{ chainId() | etherChainName }} <!-- Sepolia -->
```

### Directives

Structural directives show their template on a condition, or the ``else`` template otherwise. They follow the wallet and the network, also with zoneless change detection, and show the ``else`` template on the server.

* ``*etherWallet="let wallet; else noWallet"`` shows its template when a wallet is installed, with its ``TEtherWalletInfo`` (``name``, ``isMetaMask``)
* ``*etherConnected="let account; else connect"`` shows its template when an account is connected, with the selected account. Changing account updates the template, it is only created again on connection or disconnection
* ``*etherChain="chainId; else wrongChain"`` shows its template on a chain, or on one of an array of chains, with the current chain ID

```html
<div *etherWallet="let wallet; else noWallet">
  <p *etherConnected="let account; else connect">{{ account | etherShortAddress }} with {{ wallet.name }}</p>
</div>
<p *etherChain="[1, 11155111]; else wrongChain">Ready</p>

<ng-template #noWallet><a href="https://metamask.io">Install a wallet</a></ng-template>
<ng-template #connect><button>Connect</button></ng-template>
<ng-template #wrongChain><p>Switch to Ethereum or Sepolia</p></ng-template>
```

The ``etherConnect`` directive makes a connect button: on click, it calls ``connectWallet()``, and it is disabled (with ``aria-busy``) while the wallet asks the user. It emits the accounts with ``(etherConnectSuccess)``, or the error with ``(etherConnectError)``, for example ``ACTION_REJECTED`` when the user rejects the connection. Nothing is emitted after the button is destroyed.

```html
<button etherConnect (etherConnectSuccess)="onConnected($event)" (etherConnectError)="onError($event)">
  Connect
</button>
```

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

### NgRx SignalStore

The SignalStore features are in the ``@ashetm/ng-ether/ngrx`` entry point, which needs ``@ngrx/signals``. It is an optional peer dependency: applications that do not import ``@ashetm/ng-ether/ngrx`` do not need it.

``withEther(options?)`` adds the wallet and the network to a store:

* State, as signals: ``account``, ``accounts``, ``isConnected``, ``chainId``, ``network``, ``walletInstalled``, ``balance``, ``price``, ``gasFee`` (the signals of ``@ashetm/ng-ether``, with the same default values), ``connecting`` and ``connectError``
* ``connect()`` asks the wallet to connect: ``connecting`` is ``true`` while the wallet asks the user, and ``connectError`` holds the error of a rejected connection (``null`` after a successful one)
* ``switchNetwork(chainId)`` returns a ``Promise`` resolved once the wallet has switched (``chainId`` then follows), or rejected with the wallet error
* ``options``: ``balance`` (``true`` by default), ``price`` and ``gasFee`` (``false`` by default, as they are polled). A disabled one stays ``undefined``

```ts
import { withEther } from '@ashetm/ng-ether/ngrx';

export const WalletStore = signalStore(
  { providedIn: 'root' },
  withEther({ price: true }),
  withComputed(({ account }) => ({
    shortAccount: computed(() => account()?.slice(0, 6))
  }))
);

// In a component
readonly store = inject(WalletStore);
// Template: @if (store.isConnected()) { {{ store.shortAccount() }} } @else { <button (click)="store.connect()">Connect</button> }
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

Without an installed wallet (no ``window.ethereum``), the application starts normally, but every stream and method of ``EtherNetworkService``, ``EtherTransactionService`` and ``EtherWalletService`` emits an ``EtherWalletNotInstalledError`` (``No wallet installed``). The functions of the smart contract (``AEtherContract``, and so ``this.contract`` in your custom contracts) reject with the same error, and the ``etherContractFnAsync`` pipe displays nothing in that case, instead of throwing. With server-side rendering (Angular SSR), the server behaves the same way, as it has no ``window``: the wallet is only available once the application runs in the browser.

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

``provideEtherTesting(options?)`` provides the library with a fake wallet, that your tests control with ``EtherTestingWallet``. The services, signals, hooks, directives and transactions run as with a real wallet.

| Option | Default value |
| ------ | ------------- |
| ``accounts``: connected accounts | ``[]`` (disconnected) |
| ``connectAccounts``: accounts connected by ``connectWallet()`` | ``['0x…0001']`` |
| ``chainId`` | ``1`` |
| ``balance``: balance of every account, in wei | ``0n`` |
| ``wallet``: name of the wallet (MetaMask, Rabby, Coinbase Wallet…), or ``false`` for a browser without wallet | ``'MetaMask'`` |
| ``abi``, ``addressContract``, ``priceFeed``, ``explorers``: configuration of ``provideEther()`` | A mock ABI and the zero address |

``EtherTestingWallet`` controls the fake wallet:

* ``setAccounts(accounts)`` and ``setChainId(chainId)`` change the accounts (``[]`` disconnects) and the chain, and emit the wallet events
* ``setBalance(balance)`` changes the balance
* ``rejectNext(method, error?)`` makes the next request of a method fail, like a user rejecting it by default (``ACTION_REJECTED``, code 4001)
* ``respond(method, (params) => result)`` answers the requests of a method, for example ``eth_call`` for the reads of a contract
* ``requests`` lists every request received, to check what was sent
* ``mine(blocks?)`` mines blocks: sent transactions are mined at once, ``mine()`` reaches more confirmations
* ``await flush()`` waits until the wallet has answered every request (ethers sends them after a short delay), instead of waiting a fixed time

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideEtherTesting({ accounts: [me], chainId: 11155111, balance: 10n ** 18n })]
  });
});

it('shows the new account', async () => {
  const fixture = TestBed.createComponent(WalletComponent);
  const wallet = TestBed.inject(EtherTestingWallet);

  wallet.setAccounts([other]);
  await wallet.flush();
  await fixture.whenStable();

  expect(fixture.nativeElement.textContent).toContain(other);
});

it('handles a rejected connection', async () => {
  TestBed.inject(EtherTestingWallet).rejectNext('eth_requestAccounts');
  …
});
```

``EtherTestModule`` still provides a fixed mock of ``window.ethereum`` through ``ETHER_TOKEN``, that you can override. Prefer ``provideEtherTesting()`` in new tests.

## License

[MIT](./LICENSE)

## Issue

LOOKING FOR MAINTAINER OR IF THERE IS AN ISSUE OR ANY IDEA TO ADD. PLEASE CREATE ISSUE IN GITHUB REPOSITORY.
