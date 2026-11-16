import { EEtherNetworkChainId } from './ether-network.enum';
import { TEtherExplorer } from '../core/ether.type';

// Etherscan, the block explorer of Ethereum; other chains are added with provideEther({ explorers })
export const ETHER_DEFAULT_EXPLORER: Readonly<TEtherExplorer> = Object.freeze({
  [EEtherNetworkChainId.MAIN]: 'https://etherscan.io',
  [EEtherNetworkChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
  [EEtherNetworkChainId.HOODI]: 'https://hoodi.etherscan.io',
});

// Names shown by the etherChainName pipe, other chains are shown as 'Chain <chainId>'
export const ETHER_CHAIN_NAME: Readonly<Partial<Record<number, string>>> = Object.freeze({
  [EEtherNetworkChainId.MAIN]: 'Ethereum',
  [EEtherNetworkChainId.SEPOLIA]: 'Sepolia',
  [EEtherNetworkChainId.HOODI]: 'Hoodi',
  [EEtherNetworkChainId.LOCALHOST]: 'Localhost',
  10: 'OP Mainnet',
  56: 'BNB Smart Chain',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum One',
  43114: 'Avalanche C-Chain',
  59144: 'Linea',
});
