import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { EtherNetworkService } from './ether-network.service';
import { EtherTestModule } from './ether-test.module';
import { EtherTransactionService } from './ether-transaction.service';
import { EtherWalletNotInstalledError } from './ether-wallet-not-installed.error';
import { EtherWalletService } from './ether-wallet.service';
import { ETHER_TOKEN, ETHER_TOKEN_IS_WALLET_INSTALLED } from './ether.token';

describe('ng-ether without an installed wallet', () => {
  let networkService: EtherNetworkService;
  let transactionService: EtherTransactionService;
  let walletService: EtherWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule],
      providers: [{ provide: ETHER_TOKEN, useValue: undefined }],
    });
    networkService = TestBed.inject(EtherNetworkService);
    transactionService = TestBed.inject(EtherTransactionService);
    walletService = TestBed.inject(EtherWalletService);
  });

  it('reports that no wallet is installed', () => {
    expect(TestBed.inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).toBe(false);
  });

  const cases: [string, () => Observable<unknown>][] = [
    ['account$', () => walletService.account$],
    ['balance$', () => walletService.balance$],
    ['transactionCount$', () => walletService.transactionCount$],
    ['connectWallet()', () => walletService.connectWallet()],
    ['getBalanceOf()', () => walletService.getBalanceOf('0x0')],
    ['getTransactionCountOf()', () => walletService.getTransactionCountOf('0x0')],
    ['onAccountChange()', () => walletService.onAccountChange()],
    ['onConnect()', () => walletService.onConnect()],
    ['onDisconnect()', () => walletService.onDisconnect()],
    ['blockNumber$', () => networkService.blockNumber$],
    ['gasFee$', () => networkService.gasFee$],
    ['network$', () => networkService.network$],
    ['price$', () => networkService.price$],
    ['addNetwork()', () => networkService.addNetwork({ chainId: 137, chainName: 'Polygon', nativeCurrency: { decimals: 18, name: 'POL', symbol: 'POL' }, rpcUrls: [] })],
    ['onNetworkChange()', () => networkService.onNetworkChange()],
    ['switchNetwork()', () => networkService.switchNetwork(1)],
    ['sendEth()', () => transactionService.prepareTransaction('0x0').sendEth(1)],
  ];

  it.each(cases)('%s emits an EtherWalletNotInstalledError', async (_: string, source: () => Observable<unknown>) => {
    await expect(firstValueFrom(source())).rejects.toBeInstanceOf(
      EtherWalletNotInstalledError
    );
  });
});
