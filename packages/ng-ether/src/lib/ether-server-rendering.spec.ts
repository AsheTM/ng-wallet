import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { EtherWalletNotInstalledError } from './ether-wallet-not-installed.error';
import { EtherWalletService } from './ether-wallet.service';
import { ETHER_TOKEN, ETHER_TOKEN_IS_WALLET_INSTALLED } from './ether.token';
import { provideEther } from './ether.providers';

describe('ng-ether with server-side rendering', () => {
  beforeEach(() => {
    // A wallet on window must be ignored on the server
    (window as unknown as Record<string, unknown>)['ethereum'] = { request: () => Promise.resolve(null) };
    TestBed.configureTestingModule({
      providers: [provideEther(), { provide: PLATFORM_ID, useValue: 'server' }],
    });
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['ethereum'];
  });

  it('does not read window on the server', () => {
    expect(TestBed.inject(ETHER_TOKEN)).toBeUndefined();
    expect(TestBed.inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).toBe(false);
  });

  it('behaves as a browser without wallet', async () => {
    await expect(firstValueFrom(TestBed.inject(EtherWalletService).account$)).rejects.toBeInstanceOf(
      EtherWalletNotInstalledError
    );
  });
});
