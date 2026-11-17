import { EnvironmentProviders, inject, Injectable, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { keccak256, toBeHex, toUtf8Bytes } from 'ethers';

import { ETHER_TOKEN } from '../core/ether.token';
import { TEtherConfigurationRoot } from '../core/ether.type';
import { toHexChainId } from '../core/ether.util';
import { provideEther } from '../ether.providers';
import { ETHER_WALLET_FLAGS } from '../wallet/ether-wallet-info';

import * as abiMock from './abi.mock.json';

export type TEtherTestingOptions = Partial<TEtherConfigurationRoot> & {
  // Connected accounts, [] by default (disconnected)
  accounts?: string[];
  // Accounts connected by connectWallet() when disconnected
  connectAccounts?: string[];
  chainId?: number;
  // Balance of every account, in wei
  balance?: bigint;
  // Name of the installed wallet ('MetaMask' by default, see ETHER_WALLET_FLAGS), or false without wallet
  wallet?: string | false;
};

export type TEtherTestingRequest = { method: string; params?: unknown[] };

const ETHER_TESTING_OPTIONS = new InjectionToken<TEtherTestingOptions>('ETHER_TESTING_OPTIONS');

type TEtherTestingResponder = (params: unknown[]) => unknown;
type TEtherTestingTransaction = { hash: string; blockNumber: number; request: Record<string, string> };

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_ACCOUNT = '0x0000000000000000000000000000000000000001';
const GAS_PRICE = 1_000_000_000n;
// The fake wallet signs nothing: transactions carry a fixed, well-formed signature
const SIGNATURE = { r: `0x${'11'.repeat(32)}`, s: `0x${'22'.repeat(32)}`, v: '0x1b', yParity: '0x0' };

// A fake EIP-1193 wallet (window.ethereum) controlled by the test: accounts, chain, balance, answers and errors.
// Sent transactions are mined at once, in a new block
@Injectable()
export class EtherTestingWallet {
  // Every request received by the wallet, in order
  readonly requests: TEtherTestingRequest[] = [];
  // The object provided as window.ethereum, through ETHER_TOKEN
  readonly ethereum: Record<string, unknown>;

  private _accounts: string[];
  private _connectAccounts: string[];
  private _chainId: number;
  private _balance: bigint;
  private _blockNumber = 1;
  private _pending = 0;
  private readonly _listeners = new Map<string, Set<(value: unknown) => void>>();
  private readonly _rejections = new Map<string, unknown[]>();
  private readonly _responders = new Map<string, TEtherTestingResponder>();
  private readonly _transactions = new Map<string, TEtherTestingTransaction>();

  constructor() {
    const options: TEtherTestingOptions = inject(ETHER_TESTING_OPTIONS);
    const walletName: string = options.wallet || 'MetaMask';
    const flags: string[] = ETHER_WALLET_FLAGS.filter(([, name]) => name === walletName).map(([flag]) => flag);

    this._accounts = [...(options.accounts ?? [])];
    this._connectAccounts = [...(options.connectAccounts ?? [DEFAULT_ACCOUNT])];
    this._chainId = options.chainId ?? 1;
    this._balance = options.balance ?? 0n;
    this.ethereum = {
      // The flag of the wallet, and isMetaMask for the known wallets compatible with MetaMask (not Phantom)
      ...Object.fromEntries(flags.map((flag: string) => [flag, true])),
      isMetaMask: flags.length > 0 && walletName !== 'Phantom',
      on: (event: string, listener: (value: unknown) => void) => this._on(event, listener),
      removeListener: (event: string, listener: (value: unknown) => void) =>
        this._listeners.get(event)?.delete(listener),
      request: (request: TEtherTestingRequest) => this._request(request),
    };
  }

  // Changes the connected accounts, and emits accountsChanged ([] disconnects the wallet)
  setAccounts(accounts: string[]): void {
    this._accounts = [...accounts];
    this._emit('accountsChanged', [...accounts]);
  }

  // Changes the chain, and emits chainChanged
  setChainId(chainId: number): void {
    this._chainId = chainId;
    this._emit('chainChanged', toHexChainId(chainId));
  }

  setBalance(balance: bigint): void {
    this._balance = balance;
  }

  // Mines blocks, for example to reach the confirmations awaited by trackTransaction()
  mine(blocks = 1): void {
    this._blockNumber += blocks;
  }

  // The next request of this method fails, by default like a user rejecting it (code 4001)
  rejectNext(method: string, error: unknown = { code: 4001, message: 'User rejected the request.' }): void {
    this._rejections.set(method, [...(this._rejections.get(method) ?? []), error]);
  }

  // Answers the requests of this method, for example eth_call for the reads of a contract
  respond(method: string, responder: TEtherTestingResponder): void {
    this._responders.set(method, responder);
  }

  // Waits until the wallet has answered every request, including the ones ethers sends after a short delay
  async flush(): Promise<void> {
    for (let idle = 0; idle < 2; ) {
      const count: number = this.requests.length;

      await new Promise((resolve) => setTimeout(resolve, 20));
      idle = this._pending === 0 && this.requests.length === count ? idle + 1 : 0;
    }
  }

  private _emit(event: string, value: unknown): void {
    this._listeners.get(event)?.forEach((listener) => listener(value));
  }

  private _on(event: string, listener: (value: unknown) => void): void {
    this._listeners.set(event, (this._listeners.get(event) ?? new Set()).add(listener));
  }

  private async _request({ method, params = [] }: TEtherTestingRequest): Promise<unknown> {
    this.requests.push({ method, params });
    this._pending++;

    try {
      const rejections: unknown[] = this._rejections.get(method) ?? [];

      if (rejections.length) {
        throw rejections.shift();
      }

      const responder: TEtherTestingResponder | undefined = this._responders.get(method);

      return responder ? await responder(params) : this._answer(method, params);
    } finally {
      this._pending--;
    }
  }

  private _answer(method: string, params: unknown[]): unknown {
    switch (method) {
      case 'eth_accounts':
        return [...this._accounts];
      case 'eth_requestAccounts':
        if (!this._accounts.length) {
          this.setAccounts(this._connectAccounts);
        }
        return [...this._accounts];
      case 'eth_chainId':
        return toHexChainId(this._chainId);
      case 'net_version':
        return `${this._chainId}`;
      case 'eth_blockNumber':
        return toBeHex(this._blockNumber);
      case 'eth_getBalance':
        return toBeHex(this._balance);
      case 'eth_gasPrice':
        return toBeHex(GAS_PRICE);
      case 'eth_maxPriorityFeePerGas':
        return toBeHex(0n);
      case 'eth_estimateGas':
        return toBeHex(21_000n);
      case 'eth_getTransactionCount':
        return toBeHex(this._transactions.size);
      case 'eth_getBlockByNumber':
        return this._block();
      case 'eth_sendTransaction':
        return this._send(params[0] as Record<string, string>);
      case 'eth_getTransactionByHash':
        return this._transaction(params[0] as string);
      case 'eth_getTransactionReceipt':
        return this._receipt(params[0] as string);
      case 'wallet_switchEthereumChain':
        this.setChainId(Number(BigInt((params[0] as { chainId: string }).chainId)));
        return null;
      default:
        return null;
    }
  }

  private _block(): Record<string, unknown> {
    return {
      hash: keccak256(toUtf8Bytes(`block ${this._blockNumber}`)),
      parentHash: keccak256(toUtf8Bytes(`block ${this._blockNumber - 1}`)),
      number: toBeHex(this._blockNumber),
      timestamp: toBeHex(1_700_000_000 + this._blockNumber * 12),
      nonce: '0x0000000000000000',
      difficulty: '0x0',
      gasLimit: toBeHex(30_000_000n),
      gasUsed: '0x0',
      miner: ZERO_ADDRESS,
      extraData: '0x',
      baseFeePerGas: toBeHex(GAS_PRICE),
      transactions: [],
    };
  }

  private _send(request: Record<string, string>): string {
    const hash: string = keccak256(toUtf8Bytes(`transaction ${this._transactions.size}`));

    this._blockNumber++;
    this._transactions.set(hash, { hash, blockNumber: this._blockNumber, request });

    return hash;
  }

  private _transaction(hash: string): Record<string, unknown> | null {
    const transaction: TEtherTestingTransaction | undefined = this._transactions.get(hash);

    return transaction
      ? {
          ...SIGNATURE,
          hash,
          blockHash: keccak256(toUtf8Bytes(`block ${transaction.blockNumber}`)),
          blockNumber: toBeHex(transaction.blockNumber),
          transactionIndex: '0x0',
          type: '0x0',
          from: transaction.request['from'] ?? this._accounts[0] ?? ZERO_ADDRESS,
          to: transaction.request['to'] ?? null,
          value: transaction.request['value'] ?? '0x0',
          input: transaction.request['data'] ?? '0x',
          nonce: '0x0',
          gas: toBeHex(21_000n),
          gasPrice: toBeHex(GAS_PRICE),
          chainId: toHexChainId(this._chainId),
          accessList: [],
        }
      : null;
  }

  private _receipt(hash: string): Record<string, unknown> | null {
    const transaction: Record<string, unknown> | null = this._transaction(hash);

    return transaction
      ? {
          transactionHash: hash,
          transactionIndex: '0x0',
          blockHash: transaction['blockHash'],
          blockNumber: transaction['blockNumber'],
          from: transaction['from'],
          to: transaction['to'],
          contractAddress: null,
          logs: [],
          logsBloom: `0x${'00'.repeat(256)}`,
          gasUsed: toBeHex(21_000n),
          cumulativeGasUsed: toBeHex(21_000n),
          effectiveGasPrice: toBeHex(GAS_PRICE),
          status: '0x1',
          type: '0x0',
        }
      : null;
  }
}

// The library with the fake wallet: inject EtherTestingWallet to control it.
// With wallet: false, the application behaves as a browser without wallet
export function provideEtherTesting(options: TEtherTestingOptions = {}): EnvironmentProviders {
  const { accounts, balance, chainId, connectAccounts, wallet, ...configuration } = options;

  return makeEnvironmentProviders([
    provideEther({
      abi: abiMock,
      addressContract: ZERO_ADDRESS,
      ...configuration,
    }),
    { provide: ETHER_TESTING_OPTIONS, useValue: { accounts, balance, chainId, connectAccounts, wallet } },
    EtherTestingWallet,
    {
      provide: ETHER_TOKEN,
      useFactory: () => (wallet === false ? undefined : inject(EtherTestingWallet).ethereum),
    },
  ]);
}
