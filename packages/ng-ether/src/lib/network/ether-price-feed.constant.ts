import { EEtherNetworkChainId } from './ether-network.enum';
import { TEtherPriceFeed } from '../core/ether.type';

// Chainlink ETH / USD price feeds, see https://docs.chain.link/data-feeds/price-feeds/addresses
export const ETHER_DEFAULT_PRICE_FEED: Readonly<TEtherPriceFeed> = Object.freeze({
  [EEtherNetworkChainId.MAIN]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  // TODO: check later if Sepolia is still active and its Chainlink feed still updated
  [EEtherNetworkChainId.SEPOLIA]: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
});

// Only the Chainlink AggregatorV3Interface functions read by price$
export const ETHER_PRICE_FEED_ABI: readonly string[] = Object.freeze([
  'function decimals() view returns (uint8)',
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
]);
