import { Network } from '@ethersproject/networks';

import { EEtherNetworkChainId } from "./ether-network.enum";


export type TEtherNetwork = Network;

export type TEtherNetworkChange = {
  newNetwork: TEtherNetwork;
  oldNetwork?: TEtherNetwork;
};

export type TEtherNetworkInfo = {
  blockExplorerUrls: string[],
  chainId: TEtherNetworkInfoChainId,
  chainName: string,
  nativeCurrency: TEtherNetworkNativeCurrency,
  rpcUrls: string[]
};

export type TEtherNetworkInfoChainId
  = `0x${string | number}`
    | string
    | `${EEtherNetworkChainId}`
    | EEtherNetworkChainId;

export type TEtherNetworkNativeCurrency = {
  decimals: number,
  name: string,
  symbol: string
};
