import { EEtherNetworkChainId } from './ether-network.enum';

// import { EEtherNetwork } from './ether.enum';

// export type TEtherSupportedNetwork = Readonly<Partial<Record<`0x${number}` | number, EEtherNetwork>>>;

// ethers v6 uses native bigint instead of BigNumber
export type TEtherBigNumber = bigint;

export type TEtherConfigurationRoot = {
  addressContract: `0x${string | number}`;
  abi: string | any;
  networkId?: EEtherNetworkChainId | 'any';
};

/**
 * @deprecated
 * @unused
 */
export type TEtherError = {
  code: number;
  message: string;
} & Partial<Record<string, unknown>>;
