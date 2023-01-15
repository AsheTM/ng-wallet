
# @ashetm/ng-ether

``@ashetm/ng-ether`` is a library that simplify manipulation of library ``ethers``, and has a good interaction with Angular with its stream based with ``RXJS``. It provides also a test module that provide mock of ``window.ethereum`` in a token (see below) for testing purpose.

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

1. ``EtherModule``, that contains ``forRoot`` static method to import in order to use the library with ```TEtherConfigurationRoot``` optional configuration with abi and contract address of a deployed smart contract
1. ``EtherTestModule``, that provide a mock of ``window.ethereum`` through ``ETHER_TOKEN`` (See below) for testing purpose

### Tokens

Tokens are ``InjectionToken<T>`` that needs to be injected in order to get its value

1. ``ETHER_TOKEN`` returns ``window.ethereum`` object, if you wish a direct manipulation
2. ``ETHER_TOKEN_ABI`` returns string ``abi`` provided in configuration forRoot static method
3. ``ETHER_TOKEN_ADDRESS_CONTRACT`` returns ``addressContract`` string provided in configuration forRoot static method
4. ``ETHER_TOKEN_IS_METAMASK_WALLET`` returns boolean, true if MetaMask wallet is installed in browser
5. ``ETHER_TOKEN_IS_WALLET_INSTALLED`` returns boolean, true if the wallet is installed in browser
6. ``ETHER_TOKEN_NETWORK_ID`` returns ``networkId`` string provided in configuration forRoot static method, default value is ``any``

### Services

#### EtherNetworkService

``EtherNetworkService`` is a service concern all about network.

* ``network$`` is ``Observable<TEtherNetwork>``, it emits ``TEtherNetwork`` value of network information

Those following are ``Observable`` and emits when account or network change

* ``blockNumber$`` is ``Observable<number>`` that emits a ``number`` value of number of block
* ``gasFee$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns gas price of the current network
* ``price$`` is ``Observable<number>``, it emits ``number`` value of price of ETH

And for methods, there is the following: 

* ``addNetwork(newNetwork: TEtherNetwork)`` returns ``Observable<true | TEtherError>`` listen to if a new network is created successfully and emits a value, of type either ``true``if success or ``TEtherNetworkChange = { newNetwork: TEtherNetwork; oldNetwork?: TEtherNetwork; }`` for failure.

* ``onNetworkChange()`` returns ``Observable<TEtherNetworkChange>`` listen to network change event and emits ``TEtherNetworkChange = { newNetwork: TEtherNetwork; oldNetwork?: TEtherNetwork; }`` value that contains informations of new network and old network.

or the second definition

* ``onNetworkChange(fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void)`` returns ``void`` nothing, you need to provide a function with 2 arguments; first arguments is informùation of new network and second is information of old network.

* ``switchNetwork(chainId: EEtherNetworkChainId)`` returns ``Observable<true | TEtherError>`` listen to if the switch to a specified network is done successfully and emits a value, of type either ``true``if success or ``TEtherNetworkChange = { newNetwork: TEtherNetwork; oldNetwork?: TEtherNetwork; }`` for failure.

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

### Classes

#### AEtherContract

``AEtherContract`` is an abstract class and a token to either to implement with 0 meethod to implement or to inject, the second case it will give you an instance of Contract.

**Note**: This abstract class is available if ```TEtherConfigurationRoot``` is provided.

#### AEtherProvider

``AEtherProvider`` is an abstract class and a token to either to implement with 0 meethod to implement or to inject, the second case it will give you an instance of Web3Provider.

#### AEtherSigner

``AEtherSigner`` is an abstract class and a token to either to implement with 0 meethod to implement or to inject, the second case it will give you an instance of JsonRpcSigner.

#### ACustomContract

``ACustomContract`` is an abstract class to implement with your own custom smart contract call or transaction method, with ``Observable`` as return type. It has a super protected member calld ``contract`` that gives you access to the deployed smart contract provided in forRoot static method configuration.

### Decorators

#### ContractInjectable

```ContractInjectable``` is a class decorator, it must annotates a class that extends ``ACustomContract``. It has a parameter just like ``Injectable`` a scope to provide it in, by default is ``root``.

## Usage

### Use own deployed smart contract

You can interact with your custom deployed contract, like in the example below:

```ts

...
import { ACustomContract, ContractInjectable } from '@ashetm/ng-ether';
...

@ContractInjectable() // Compulsory, to annotate it
export class CustomContract extends ACustomContract { // Compulsory, extends ACustomContract

  test(): Observable<any> {
    return from(this.contract["decimals"]());
  }

}

```

## Issue

LOOKING FOR MAINTAINER OR IF THERE IS AN ISSUE OR ANY IDEA TO ADD. PLEASE CREATE ISSUE IN GITHUB REPOSITORY.
