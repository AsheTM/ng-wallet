# Migrate @ashetm/ng-ether from 16.x to 20.x

``20.x`` supports Angular 20 and moves from ``ethers`` 5 to ``ethers`` 6. This guide lists the changes to make in your application, from the most common to the rarest.

## 1. Update the dependencies

``20.x`` needs Angular 20. ``ethers`` 6 is installed with the library.

```bash
npm install @ashetm/ng-ether@20
```

If your application also uses ``ethers`` directly, update it to ``6.x`` and follow the [ethers v6 migration guide](https://docs.ethers.org/v6/migrating/).

## 2. Replace `EtherModule.forRoot()` with `provideEther()`

``EtherModule.forRoot()`` still works, but it is deprecated and will be removed in the next major version. ``provideEther()`` takes the same configuration.

```ts
// Before
@NgModule({
  imports: [EtherModule.forRoot({ abi, addressContract })]
})
export class AppModule { }

// After
export const appConfig: ApplicationConfig = {
  providers: [provideEther({ abi, addressContract })]
};
```

``EtherContractFnAsyncPipe`` is now standalone: import it in the components that use it, as ``EtherModule`` is no longer needed to get it.

## 3. `TEtherBigNumber` is `bigint`

ethers 6 replaced its ``BigNumber`` class with the native ``bigint``, so ``balance$``, ``gasFee$`` and ``getBalanceOf()`` now emit ``bigint`` values.

```ts
// Before
balance.add(amount).gt(limit);
balance.toNumber();

// After
balance + amount > limit;
Number(balance); // Only for small values, bigint keeps the full precision
```

``formatEther()``, ``formatGwei()``, ``formatMwei()``, ``formatKwei()`` and ``formatWei()`` work as before, with ``bigint`` values.

## 4. Update the `etherContractFnAsync` pipe calls

The pipe now takes the custom contract and the method name, so the method is called on its contract and can use ``this.contract``. In ``16.x``, a method using ``this`` threw an error, and the pipe did not display the values of asynchronous calls.

```html
<!-- Before -->
{{ customContract.decimals | etherContractFnAsync }}
{{ customContract.balanceOf | etherContractFnAsync: address }}

<!-- After -->
{{ customContract | etherContractFnAsync: 'decimals' }}
{{ customContract | etherContractFnAsync: 'balanceOf' : address }}
```

The extra arguments are still passed to the method as one array.

## 5. Pass a `TEtherNetworkInfo` to `addNetwork()`

``addNetwork()`` now takes the network as described by the wallet ([EIP-3085](https://eips.ethereum.org/EIPS/eip-3085)), instead of an ethers ``Network`` object, which the wallets rejected.

```ts
networkService.addNetwork({
  chainId: 137,
  chainName: 'Polygon',
  nativeCurrency: { decimals: 18, name: 'POL', symbol: 'POL' },
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com'] // Optional
});
```

``addNetwork()`` and ``switchNetwork()`` now return ``Observable<true>``: errors are emitted as ``Observable`` errors, not as values.

## 6. Handle the errors that are now emitted

Several streams and methods now emit errors that were lost, or that crashed the application, in ``16.x``:

* Without wallet (or on the server with server-side rendering), every stream and method of the services emits an ``EtherWalletNotInstalledError``, instead of throwing a ``TypeError``. See "Handle a browser without wallet" in the README
* ``connectWallet()`` emits an error when the user rejects the connection, with the ethers code ``ACTION_REJECTED``, and completes after emitting the accounts
* ``getBalanceOf()`` emits an error when the request fails, and completes after emitting the balance
* ``price$`` now emits the price of ETH in USD from a Chainlink price feed. In ``16.x``, it always failed. On a network without a feed, it emits an error ``No price feed configured for chain <chainId>``

```ts
import { isError } from 'ethers';

walletService.connectWallet().subscribe({
  next: (accounts: string[]) => ...,
  error: (error: unknown) => {
    if (isError(error, 'ACTION_REJECTED')) {
      // The user rejected the connection
    }
  }
});
```

## 7. Replace the deprecated testnets

Ropsten, Rinkeby, Goerli and Kovan are shut down. Their ``EEtherNetworkChainId`` values are deprecated and will be removed in the next major version.

```ts
// Before
EEtherNetworkChainId.GOERLI

// After
EEtherNetworkChainId.SEPOLIA // Applications
EEtherNetworkChainId.HOODI // Validators and staking providers
```

## 8. Rare cases

These changes only concern applications that use the classes of the library directly:

* ``AEtherProvider`` is an ethers ``BrowserProvider`` instead of ``Web3Provider``
* ``AEtherSigner`` is an ``EtherSigner`` (an ethers ``AbstractSigner``) instead of ``JsonRpcSigner``. It always uses the account selected in the wallet
* ``AEtherProvider`` and ``AEtherSigner`` are ``null`` without wallet
* ``EtherNetworkService``, ``EtherTransactionService``, ``EtherWalletService`` and ``EtherContractFnAsyncPipe`` use ``inject()``: their constructors have no parameter, and subclasses or ``new`` calls must run in an injection context
* ``@ContractInjectable()`` classes are provided in root, instead of in ``EtherRootModule``
* ``TEtherTransactionRequest`` is a plain ethers ``TransactionRequest`` subset, without ``Deferrable``
* ``TEtherNetworkInfoChainId`` accepts any number, and ``TEtherNetworkInfo`` has optional ``blockExplorerUrls`` and ``iconUrls``
* ``switchNetwork()`` converts decimal chain IDs to hexadecimal correctly: ``137`` is sent as ``'0x89'``, not ``'0x137'``

## New in 20.x

Not required for the migration, but available:

* Route guards in ``@ashetm/ng-ether/router``: ``requireWallet()``, ``requireConnection()``, ``requireChain()`` and ``requireAccount()``
* ``sendKWei()`` on ``EtherTransactionRef``
* ``toHexChainId()``, ``ETHER_TOKEN_PRICE_FEED`` and ``ETHER_DEFAULT_PRICE_FEED``
* Support of zoneless change detection and server-side rendering
