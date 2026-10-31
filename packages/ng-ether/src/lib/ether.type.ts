import { BigNumber } from '@ethersproject/bignumber';

import { EEtherNetworkChainId } from './ether-network.enum';

// import { EEtherNetwork } from './ether.enum';


// export type TEtherSupportedNetwork = Readonly<Partial<Record<`0x${number}` | number, EEtherNetwork>>>;

export type TEtherBigNumber = BigNumber;

export type TEtherConfigurationRoot = {
  addressContract: `0x${string | number}`;
  abi: string | any;
  networkId?: EEtherNetworkChainId | 'any';
};

export type TEtherError = {
  code: number;
  message: string;
} & Partial<Record<string, unknown>>;
