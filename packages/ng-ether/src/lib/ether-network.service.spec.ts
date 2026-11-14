import { TestBed } from '@angular/core/testing';
import { Interface, TransactionRequest } from 'ethers';
import { firstValueFrom, Observable } from 'rxjs';

import { EEtherNetworkChainId } from './ether-network.enum';
import { EtherNetworkService } from './ether-network.service';
import { ETHER_DEFAULT_PRICE_FEED, ETHER_PRICE_FEED_ABI } from './ether-price-feed.constant';
import { AEtherProvider } from './ether-provider.class';
import { EtherTestModule } from './ether-test.module';
import { ETHER_TOKEN, ETHER_TOKEN_PRICE_FEED } from './ether.token';
import { TEtherPriceFeed } from './ether.type';


describe('EtherNetworkService', () => {
  let service: EtherNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule]
    });
    service = TestBed.inject(EtherNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have blockNumber$', () => {
    expect(service.blockNumber$).toBeDefined();
  });

  it('should have gasFee$', () => {
    expect(service.gasFee$).toBeDefined();
  });

  it('should have network$', () => {
    expect(service.network$).toBeDefined();
  });

  it('should have price$', () => {
    expect(service.price$).toBeDefined();
  });

  it('should have onNetworkChange', () => {
    expect(service.onNetworkChange).toBeDefined();
    expect(service.onNetworkChange()).toBeInstanceOf(Observable);
    expect(service.onNetworkChange((_: any) => null)).toBeUndefined();
  });
});

describe('EtherNetworkService price$', () => {
  const priceFeedInterface: Interface = new Interface(ETHER_PRICE_FEED_ABI);
  const setUp = (chainId: string, priceFeed?: TEtherPriceFeed): EtherNetworkService => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule],
      providers: [
        {
          provide: ETHER_TOKEN,
          useValue: {
            on: () => void 0,
            removeListener: () => void 0,
            request: ({ method }: { method: string }) =>
              Promise.resolve(method === 'eth_chainId' ? chainId : null)
          }
        },
        ...(priceFeed ? [{ provide: ETHER_TOKEN_PRICE_FEED, useValue: priceFeed }] : [])
      ]
    });
    const provider: AEtherProvider = TestBed.inject(AEtherProvider);

    // Answers the price feed calls like a Chainlink aggregator: 8 decimals, 3124.57 USD
    jest.spyOn(provider, 'call').mockImplementation(async ({ data }: TransactionRequest) =>
      priceFeedInterface.parseTransaction({ data: data ?? '0x' })?.name === 'decimals'
        ? priceFeedInterface.encodeFunctionResult('decimals', [8])
        : priceFeedInterface.encodeFunctionResult('latestRoundData', [1, 312457000000n, 0, 0, 1])
    );

    return TestBed.inject(EtherNetworkService);
  };

  afterEach(() => jest.restoreAllMocks());

  it('emits the price in USD from the default Ethereum mainnet feed', async () => {
    const service: EtherNetworkService = setUp('0x1');
    const provider: AEtherProvider = TestBed.inject(AEtherProvider);

    expect(await firstValueFrom(service.price$)).toBe(3124.57);
    expect(provider.call).toHaveBeenCalledWith(
      expect.objectContaining({ to: ETHER_DEFAULT_PRICE_FEED[EEtherNetworkChainId.MAIN] })
    );
  });

  it('uses the configured feed of the current chain', async () => {
    const address = '0x0000000000000000000000000000000000000089' as const;
    const service: EtherNetworkService = setUp('0x89', { 137: address });

    expect(await firstValueFrom(service.price$)).toBe(3124.57);
    expect(TestBed.inject(AEtherProvider).call).toHaveBeenCalledWith(
      expect.objectContaining({ to: address })
    );
  });

  it('emits an error on a chain without a feed', async () => {
    const service: EtherNetworkService = setUp('0x539');

    await expect(firstValueFrom(service.price$)).rejects.toThrow(
      'No price feed configured for chain 1337'
    );
  });
});
