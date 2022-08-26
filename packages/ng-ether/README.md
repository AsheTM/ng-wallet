
# @ashetm/ng-ether

*It works with Angular 12 and above*

``@ashetm/ng-ether`` is a library that simplify manipulation of library ``ethers``, and has a good interaction with Angular with its stream based with ``RXJS``.

<!-- [![build status](http://img.shields.io/travis/likeastore/ngDialog.svg)](https://travis-ci.org/likeastore/ngDialog) -->
<!-- [![npm version](http://badge.fury.io/js/ng-dialog.svg)](http://badge.fury.io/js/ng-dialog) -->
<!-- [![github tag](https://img.shields.io/github/tag/likeastore/ngDialog.svg)](https://github.com/likeastore/ngDialog/tags) -->
<!-- [![Download Count](https://img.shields.io/npm/dm/ng-dialog.svg)](http://www.npmjs.com/package/ng-dialog) -->
<!-- [![Code Climate](https://codeclimate.com/github/likeastore/ngDialog/badges/gpa.svg)](https://codeclimate.com/github/likeastore/ngDialog) -->


<!-- ### [Demo](http://likeastore.github.io/ngDialog) -->

## Install

You can install it with npm:

```bash
npm install @ashetm/ng-ether
```

## Import

You only need to import ``EtherModule`` through ``forRoot`` static method.

```ts
...
import { EtherModule } from '@ashetm/ng-ether';
...
@NgModule({
  ...
  imports: [
    ...
    EtherModule.forRoot(), 
    ...
  ]
  ...
})
export class AppModule { }
```

## API

``@ashetm/ng-ether`` exposes the following: 

### Modules

1. ``EtherModule``, that contains ``forRoot`` static method to import in order to use the library
1. ``EtherTestModule``, that provide a mock of window.ethereum or mock of ``ETHER_TOKEN`` (See below) for testing purpose

### Tokens

Tokens are ``InjectionToken<T>`` that needs to be injected in order to get its value

1. ``ETHER_TOKEN_IS_WALLET_INSTALLED`` returns boolean, true if the wallet is installed in browser
2. ``ETHER_TOKEN_IS_METAMASK_WALLET`` returns boolean, true if MetaMask wallet is installed in browser
3. ``ETHER_TOKEN`` returns ``window.ether`` object, if you wish a direct manipulation

### Services

#### EtherNetworkService

``EtherNetworkService`` is a service concern all about network.

* ``network$`` is ``Observable<TEtherNetwork>``, it emits ``TEtherNetwork`` value of network information

Those following are ``Observable`` and emits when account or network change

* ``blockNumber$`` is ``Observable<number>`` that emits a ``number`` value of number of block
* ``gasFee$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns gas price of the current network
* ``price$`` is ``Observable<number>``, it emits ``number`` value of price of ETH

And for methods, there is the following: 

* ``onNetworkChange()`` returns ``Observable<TEtherNetworkChange>`` listen to network change event and emits ``TEtherNetworkChange = { newNetwork: TEtherNetwork; oldNetwork?: TEtherNetwork; }`` value that contains informations of new network and old network.

or the second definition

* ``onNetworkChange(fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void)`` returns ``void`` nothing, you need to provide a function with 2 arguments; first arguments is informùation of new network and second is information of old network.

#### EtherTransactionService

``EtherTransactionService`` is a service concern all about transaction.

For methods, there is the following: 

* ``prepareTransaction(addressWallet: string)`` returns ``EtherTransactionRef`` that contains 3 methods: ``sendEth(amount: number)``, ``sendGWei(amount: number)`` and ``sendWei(amount: number)`` that you specify amount to send with its appropriate unit; each of one returns ``Observable<TEtherTransactionResponse>``. It launch to sending transaction after subscribing to the obserable.

#### EtherWalletService

``EtherWalletService`` is a service concern all about wallet.

* ``account$`` is ``Observable<string>`` that emits the address wallet of the connected account
* ``balance$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns balance of the connected wallet
* ``transactionCount$`` is ``Observable<number>``, it emits ``number`` value of transaction count

And for methods, there is the following: 

* ``connectWallet()`` returns ``Observable<string[]>`` tries to connect the current wallet and returns the current connected wallet in array
* ``getBalanceOf(addressWallet: string)`` is ``Observable<TEtherBigNumber>`` that emits balance information of the provided address wallet
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

## Issue

LOOKING FOR MAINTAINER OR IF THERE IS AN ISSUE OR ANY IDEA TO ADD. PLEASE CREATE ISSUE IN GITHUB REPOSITORY.
