import { Network } from 'ethers';

import { EEtherNetworkChainId } from "./ether-network.enum";


export type TEtherNetwork = Network;

export type TEtherNetworkChange = {
  newNetwork: TEtherNetwork;
  oldNetwork?: TEtherNetwork;
};

// Network to add to the wallet, as described by EIP-3085 (wallet_addEthereumChain)
export type TEtherNetworkInfo = {
  blockExplorerUrls?: string[],
  chainId: TEtherNetworkInfoChainId,
  chainName: string,
  iconUrls?: string[],
  nativeCurrency: TEtherNetworkNativeCurrency,
  rpcUrls: string[]
};

export type TEtherNetworkInfoChainId
  = `0x${string | number}`
    | string
    | `${EEtherNetworkChainId}`
    | EEtherNetworkChainId
    | number;

export type TEtherNetworkNativeCurrency = {
  decimals: number,
  name: string,
  symbol: string
};
