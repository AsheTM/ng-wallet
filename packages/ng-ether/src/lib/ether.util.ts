import { formatUnits } from 'ethers/lib/utils';

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
export { formatEther } from 'ethers/lib/utils';
