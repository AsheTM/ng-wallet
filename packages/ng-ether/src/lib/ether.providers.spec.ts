import { TestBed } from '@angular/core/testing';
import { BrowserProvider, Contract } from 'ethers';

import { AEtherContract } from './contract/ether-contract.class';
import { AEtherProvider } from './core/ether-provider.class';
import { AEtherSigner, EtherSigner } from './core/ether-signer.class';
import {
  ETHER_TOKEN,
  ETHER_TOKEN_ABI,
  ETHER_TOKEN_ADDRESS_CONTRACT,
  ETHER_TOKEN_IS_METAMASK_WALLET,
  ETHER_TOKEN_IS_WALLET_INSTALLED,
  ETHER_TOKEN_NETWORK_ID,
  ETHER_TOKEN_PRICE_FEED,
} from './core/ether.token';
import { TEtherConfigurationRoot } from './core/ether.type';
import { provideEther } from './ether.providers';
import { EEtherNetworkChainId } from './network/ether-network.enum';
import { EtherNetworkService } from './network/ether-network.service';
import { ETHER_DEFAULT_PRICE_FEED } from './network/ether-price-feed.constant';
import { EtherTransactionService } from './transaction/ether-transaction.service';
import { EtherWalletNotInstalledError } from './wallet/ether-wallet-not-installed.error';
import { EtherWalletService } from './wallet/ether-wallet.service';

import * as abiMock from './testing/abi.mock.json';

const wallet = {
  isMetaMask: true,
  on: () => void 0,
  removeListener: () => void 0,
  request: () => Promise.resolve(null),
};

const configure = (configuration?: TEtherConfigurationRoot, isWalletInstalled = true): void => {
  TestBed.configureTestingModule({
    providers: [
      provideEther(configuration),
      { provide: ETHER_TOKEN, useValue: isWalletInstalled ? wallet : undefined },
    ],
  });
};

describe('provideEther', () => {
  it('registers the services without EtherModule', () => {
    configure();

    expect(TestBed.inject(EtherNetworkService)).toBeInstanceOf(EtherNetworkService);
    expect(TestBed.inject(EtherTransactionService)).toBeInstanceOf(EtherTransactionService);
    expect(TestBed.inject(EtherWalletService)).toBeInstanceOf(EtherWalletService);
  });

  it('creates the provider and the signer from the injected wallet', () => {
    configure();

    expect(TestBed.inject(AEtherProvider)).toBeInstanceOf(BrowserProvider);
    expect(TestBed.inject(AEtherSigner)).toBeInstanceOf(EtherSigner);
    expect(TestBed.inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).toBe(true);
    expect(TestBed.inject(ETHER_TOKEN_IS_METAMASK_WALLET)).toBe(true);
  });

  it('provides the defaults without configuration', () => {
    configure();

    expect(TestBed.inject(ETHER_TOKEN_NETWORK_ID)).toBe('any');
    expect(TestBed.inject(ETHER_TOKEN_PRICE_FEED)).toEqual(ETHER_DEFAULT_PRICE_FEED);
  });

  it('provides the configuration', () => {
    const addressContract = '0x0000000000000000000000000000000000000001' as const;

    configure({ abi: abiMock, addressContract, networkId: EEtherNetworkChainId.SEPOLIA });

    expect(TestBed.inject(ETHER_TOKEN_ADDRESS_CONTRACT)).toBe(addressContract);
    expect(TestBed.inject(ETHER_TOKEN_ABI)).toBe(abiMock);
    expect(TestBed.inject(ETHER_TOKEN_NETWORK_ID)).toBe(EEtherNetworkChainId.SEPOLIA);
    expect(TestBed.inject(AEtherContract)).toBeInstanceOf(Contract);
    expect((TestBed.inject(AEtherContract) as unknown as Contract).target).toBe(addressContract);
  });

  it('adds the configured price feeds to the default ones, and overrides them for the same chain', () => {
    const polygonFeed = '0x0000000000000000000000000000000000000089' as const;
    const mainFeed = '0x0000000000000000000000000000000000000001' as const;

    configure({
      abi: abiMock,
      addressContract: '0x0000000000000000000000000000000000000000',
      priceFeed: { 137: polygonFeed, [EEtherNetworkChainId.MAIN]: mainFeed },
    });

    expect(TestBed.inject(ETHER_TOKEN_PRICE_FEED)).toEqual({
      [EEtherNetworkChainId.MAIN]: mainFeed,
      [EEtherNetworkChainId.SEPOLIA]: ETHER_DEFAULT_PRICE_FEED[EEtherNetworkChainId.SEPOLIA],
      137: polygonFeed,
    });
  });

  it('provides a contract whose functions reject with EtherWalletNotInstalledError without wallet', async () => {
    const addressContract = '0x0000000000000000000000000000000000000001' as const;

    configure({ abi: abiMock, addressContract }, false);
    const contract: Contract = TestBed.inject(AEtherContract) as unknown as Contract;

    await expect(contract['name']()).rejects.toBeInstanceOf(EtherWalletNotInstalledError);
    // The other members of the contract stay available
    expect(contract.target).toBe(addressContract);
  });

  it('provides no provider nor signer without wallet', () => {
    configure(undefined, false);

    expect(TestBed.inject(AEtherProvider)).toBeNull();
    expect(TestBed.inject(AEtherSigner)).toBeNull();
    expect(TestBed.inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).toBe(false);
  });
});
