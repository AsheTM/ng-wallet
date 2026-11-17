import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, Subscription } from 'rxjs';

import { EtherNetworkService } from '../network/ether-network.service';
import { TEtherNetwork } from '../network/ether-network.type';
import { EtherTestingWallet, provideEtherTesting } from '../testing/ether-testing';
import { EtherWalletService } from '../wallet/ether-wallet.service';

const me = '0x0000000000000000000000000000000000000001';

// Collects the last value of a stream
function follow<T>(source: Observable<T>): { last: () => T | undefined; subscription: Subscription } {
  let last: T | undefined;
  const subscription: Subscription = source.subscribe((value: T) => (last = value));

  return { last: () => last, subscription };
}

describe('AEtherService first read and wallet events', () => {
  let wallet: EtherTestingWallet;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideEtherTesting({ connectAccounts: [me] })] });
    wallet = TestBed.inject(EtherTestingWallet);
  });

  it('keeps the account connected during the first read of the accounts', async () => {
    const walletService: EtherWalletService = TestBed.inject(EtherWalletService);
    const account = follow(walletService.account$);

    // Connects before the first read (eth_accounts) has answered
    await firstValueFrom(walletService.connectWallet());
    await wallet.flush();

    expect(account.last()).toBe(me);
    account.subscription.unsubscribe();
  });

  it('keeps the chain switched during the first read of the network', async () => {
    const network = follow<TEtherNetwork>(TestBed.inject(EtherNetworkService).network$);

    // Switches before the first read (getNetwork) has answered
    wallet.setChainId(11155111);
    await wallet.flush();

    expect(Number(network.last()?.chainId)).toBe(11155111);
    network.subscription.unsubscribe();
  });
});
