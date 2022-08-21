import { BigNumber } from '@ethersproject/bignumber';
import { Network } from '@ethersproject/networks';

// import { EEtherNetwork } from './ether.enum';


// export type TEtherSupportedNetwork = Readonly<Partial<Record<`0x${number}` | number, EEtherNetwork>>>;

export type TEtherNetwork = Network;

export type TEtherNetworkChange = {
  newNetwork: TEtherNetwork;
  oldNetwork?: TEtherNetwork;
};

export type TEtherBigNumber = BigNumber;
