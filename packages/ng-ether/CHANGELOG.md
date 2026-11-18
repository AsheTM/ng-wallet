# 20.7.0-beta.0

- [x] Add the `@ashetm/ng-ether/ngrx` entry point with the `withEther` SignalStore feature (`@ngrx/signals` optional peer dependency)
- [x] Add the `withEtherTransaction` SignalStore feature, to track a transaction in a store
- [x] Fix the first read of the accounts and the network overwriting newer wallet events
- [x] Fix `gasFee$` emitting its first value after one second

# 20.6.0

- [x] Add `provideEtherTesting` and `EtherTestingWallet`, a fake wallet controlled by the tests
- [x] Fix the flaky zoneless test, waiting for the wallet with `flush()` instead of a fixed delay

# 20.5.0

- [x] Add `fromContractEvent`, `queryContractEvents` and `onContractEvent` to follow and query contract events
- [x] Add `injectErc20Token` to read and send ERC-20 tokens

# 20.4.0

- [x] Add pipes `etherShortAddress`, `etherUnits`, `etherExplorerLink` and `etherChainName`, and the `explorers` configuration
- [x] Add structural directives `*etherWallet`, `*etherConnected` and `*etherChain`, and signals `injectWalletInstalled` and `injectWalletInfo`
- [x] Add the `etherConnect` directive for connect buttons

# 20.3.0

- [x] Add `trackTransaction` to follow a transfer or a contract call: `pending`, `submitted`, `confirmed` or `failed`
- [x] Add `injectTransaction` to track a transaction as a signal, stopped with its component

# 20.2.0

- [x] Add signal functions `injectAccount`, `injectAccounts`, `injectIsConnected`, `injectBalance`, `injectNetwork`, `injectChainId`, `injectGasFee` and `injectPrice`
- [x] Add hook functions `onWalletConnect`, `onWalletDisconnect`, `onAccountChange` and `onNetworkChange`, removed with their component

# 20.1.0

- [x] Support Angular 20 and later (peer dependencies `>=20.0.0`), verified with Angular 20, 21 and 22
- [x] Add the MIT `LICENSE` file, also shipped in the npm package

# 20.0.0

- [x] Update ng-ether to be compatible with Angular v20, see [MIGRATION.md](./MIGRATION.md) to upgrade from 16.x
- [x] Update ethers to v6, `TEtherBigNumber` is now `bigint`
- [x] Add `provideEther()` for standalone applications, and deprecate `EtherModule.forRoot()`
- [x] Use `inject()` in services and pipe, make `etherContractFnAsync` pipe standalone
- [x] Support zoneless change detection and server-side rendering
- [x] Add route guards `requireWallet`, `requireConnection`, `requireChain` and `requireAccount` in the `@ashetm/ng-ether/router` entry point
- [x] Read `price$` from Chainlink price feeds, with the `priceFeed` configuration
- [x] Call `etherContractFnAsync` methods on their contract (`contract | etherContractFnAsync: 'method'`), with typed arguments, and display their values once resolved
- [x] Emit `EtherWalletNotInstalledError` when no wallet is installed, from the services and the smart contract functions
- [x] Send valid chain requests from `addNetwork` (EIP-3085) and `switchNetwork`
- [x] Add `sendKWei` and `toHexChainId`
- [x] Add Sepolia and Hoodi to `EEtherNetworkChainId`, and deprecate the shut down testnets
- [x] Fix account and network refresh using `race` instead of `merge`
- [x] Fix `sendGWei` sending a wrong amount
- [x] Fix `forRoot()` without configuration throwing `NullInjectorError`
- [x] Fix `addNetwork`, `switchNetwork`, `connectWallet` and `getBalanceOf` errors not emitted
- [x] Fix wallet event listeners never removed
- [x] Fix `balance$` emitting unchanged balances
- [x] Fix peer dependencies still accepting Angular v16 to v19
- [x] Use `Nullable` from `@ashetm/types` for nullable types
- [x] Check the environment with `isBrowser()` from `@ashetm/platform` in `ETHER_TOKEN`
- [x] Group library files by feature
- [x] Migrate workspace to Nx 24, Jest 30 and ESLint 9 flat configuration

# 16.4.0

- [x] Rework balance realtime tracking
- [x] Rework gasFee realtime tracking
- [x] Rework current account realtime tracking
- [x] Create format crypto currency concerning eth

# 16.3.1

- [x] Fix issue of chainId type in add new network and switch to network

# 16.3.0

- [x] Add feature switch network
- [x] Add feature add new network

# 16.2.1

- [x] Fix type of first value of pipe EtherContractFnAsyncPipe
- [x] Fix export issue of EtherContractFnAsyncPipe

# 16.2.0

- [x] Create async pipe for implemeted functions for custom contract

# 16.1.4

- [x] Fix issue of getting null signer in contract instance

# 16.1.3

- [x] Correct README.md's ng-ether
- [x] Resolve issue of not able to type arguments properly of custom implemented custom contract service class

# 16.1.2

- [x] Cover with unit test decorator and custom contract part/feature
- [x] Resolve issue of not able to inject Custom Contract Service

# 16.1.1

- [x] Resolve issue of export custom ether decorator, abstract class and type

# 16.1.0

- [x] Implement contract service with also consuming possibility of 1 smart contract

# 16.0.0

- [x] Update version ng-ether to be compatible with Angular v16, v17, v18 and v19
- [x] Build ng-ether in partial compilation mode with Angular v16
- [x] Fix mock of `window.ethereum` in `EtherTestModule`
- [x] Document compatibility table, pipe and utils in README.md

# 1.0.7

- [x] Update README.md doc ng-ether

# 1.0.6

- [x] Update README.md doc ng-ether

# 1.0.5

- [x] Update README.md doc ng-ether

# 1.0.4

- [x] Write unit tests for ng-ether
- [x] Create a ether test module

# 1.0.3

- [x] Fix issue of constructor for Angular services

# 1.0.2

- [x] Fix issue of ETHER_TOKEN that throw error

# 1.0.1

- [x] Add v1.0.1 to CHANGELOG of ng-ether

# 1.0.0

- [x] Replace ``EtherProviderService`` with 3 independants services ``EtherNetworkService``, ``EtherTransactionService`` and ``EtherWalletService``

# 0.1.5

- [x] Modify README.md of @ashetm/ng-ether

# 0.1.4

- [x] Fix issue of ETHER_TOKEN throw error at the start of any app once we import EtherModule#forRoot

# 0.1.3

- [x] Disable Ivy
- [x] Support from Angular 12 and above, instead of Angular 14 and above

# 0.1.2

- [x] Revert "Add some dependencies in package.json"

# 0.1.1

- [x] Add git repository url in package.json
- [x] Add some dependencies in package.json

# 0.1.0

- [x] Implement `EtherProviderService` with RXJS logic that suits Angular
- [x] Implement tokens
- [x] Implement basic ether module
