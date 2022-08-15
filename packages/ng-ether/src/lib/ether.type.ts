import { BigNumber } from '@ethersproject/bignumber';
import { Network } from '@ethersproject/networks';


export type TEtherNetwork = Network;

export type TEtherNetworkChange = {
  newNetwork: TEtherNetwork;
  oldNetwork?: TEtherNetwork;
};

export type TEtherBigNumber = BigNumber;
