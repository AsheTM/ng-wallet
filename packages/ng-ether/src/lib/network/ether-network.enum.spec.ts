import { EEtherNetworkChainId } from './ether-network.enum';
import { ETHER_DEFAULT_PRICE_FEED } from './ether-price-feed.constant';

describe('EEtherNetworkChainId', () => {
  it.each([
    ['MAIN', 1],
    ['SEPOLIA', 11155111],
    ['HOODI', 560048],
    ['LOCALHOST', 1337],
  ])('%s is chain %i', (name: string, chainId: number) => {
    expect(EEtherNetworkChainId[name as keyof typeof EEtherNetworkChainId]).toBe(chainId);
  });

  it('provides a default price feed for the Sepolia testnet', () => {
    expect(ETHER_DEFAULT_PRICE_FEED[EEtherNetworkChainId.SEPOLIA]).toBe(
      '0x694AA1769357215DE4FAC081bf1f309aDC325306'
    );
  });
});
