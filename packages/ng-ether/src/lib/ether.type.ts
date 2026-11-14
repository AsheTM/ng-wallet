import { EEtherNetworkChainId } from './ether-network.enum';

// import { EEtherNetwork } from './ether.enum';

// export type TEtherSupportedNetwork = Readonly<Partial<Record<`0x${number}` | number, EEtherNetwork>>>;

// ethers v6 uses native bigint instead of BigNumber
export type TEtherBigNumber = bigint;

// Address of a Chainlink price feed (native currency / USD) per chain ID
export type TEtherPriceFeed = Partial<Record<number, `0x${string}`>>;

export type TEtherConfigurationRoot = {
  addressContract: `0x${string | number}`;
  abi: string | any;
  networkId?: EEtherNetworkChainId | 'any';
  // Added to the default feeds (Ethereum mainnet and Sepolia), and overrides them for the same chain
  priceFeed?: TEtherPriceFeed;
};

/**
 * @deprecated
 * @unused
 */
export type TEtherError = {
  code: number;
  message: string;
} & Partial<Record<string, unknown>>;
