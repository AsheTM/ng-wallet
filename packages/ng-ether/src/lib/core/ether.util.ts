import { formatUnits } from 'ethers';

import { TEtherNetworkInfoChainId } from '../network/ether-network.type';
import { TEtherBigNumber } from './ether.type';


function formatGwei(value: TEtherBigNumber): string {
  return formatUnits(value, 'gwei');
}

function formatKwei(value: TEtherBigNumber): string {
  return formatUnits(value, 'kwei');
}

function formatMwei(value: TEtherBigNumber): string {
  return formatUnits(value, 'mwei');
}

function formatWei(value: TEtherBigNumber): string {
  return formatUnits(value, 'wei');
}

export {
  formatGwei,
  formatKwei,
  formatMwei,
  formatWei
};
export { formatEther } from 'ethers';

// Converts a chain ID (number, decimal string or hexadecimal string) to the hexadecimal string expected by wallets
export function toHexChainId(chainId: TEtherNetworkInfoChainId): `0x${string}` {
  return `0x${BigInt(chainId).toString(16)}`;
}
