
# @ashetm/ng-ether

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

### Tokens

Tokens are ``InjectionToken<T>`` that needs to be injected in order to get its value

1. ``ETHER_TOKEN_IS_WALLET_INSTALLED`` returns boolean, true if the wallet is installed in browser
2. ``ETHER_TOKEN_IS_METAMASK_WALLET`` returns boolean, true if MetaMask wallet is installed in browser
3. ``ETHER_TOKEN`` returns ``window.ether`` object, if you wish a direct manipulation

### Services

#### EtherProviderService

``EtherProviderService`` is a service that provide information about wallet and network.

* ``accountChange$`` is ``Observable<string[]>`` that emits array of connected wallet
* ``connect$`` is ``Observable<boolean>`` that emits ``true`` if wallet is connected, ``false`` if not
* ``disconnect$`` is ``Observable<void>`` that emits a ``void`` value if wallet has disconnected
* ``networkChange$`` is ``Observable<TEtherNetworkChange>`` that emits a ``TEtherNetworkChange = { newNetwork: TEtherNetwork; oldNetwork?: TEtherNetwork; }`` value when network has changed

Those following are ``Observable`` and emits when account or network change

* ``balance$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns balance of the connected wallet
* ``blockNumber$`` is ``Observable<number>`` that emits a ``number`` value of number of block
* ``gasFee$`` is ``Observable<TEtherBigNumber>`` that emits a ``TEtherBigNumber`` value, it concerns gas price of the current network
* ``price$`` is ``Observable<number>``, it emits ``number`` value of price of ETH
* ``transactionCount$`` is ``Observable<number>``, it emits ``nubmer`` value of transaction count

And for methods, there is the following: 

* ``connectWallet()`` returns ``Observable<string[]>`` tries to connect the current wallet and returns the current connected wallet in array

## Issue

LOOKING FOR MAINTAINER OR IF THERE IS AN ISSUE OR ANY IDEA TO ADD. PLEASE CREATE ISSUE IN GITHUB REPOSITORY.
