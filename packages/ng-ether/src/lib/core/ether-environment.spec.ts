import { TestBed } from '@angular/core/testing';
import { isBrowser } from '@ashetm/platform';

import { ETHER_TOKEN, ETHER_TOKEN_IS_WALLET_INSTALLED } from './ether.token';
import { provideEther } from '../ether.providers';

jest.mock('@ashetm/platform', () => ({ isBrowser: jest.fn() }));

describe('ng-ether environment', () => {
  const wallet = { request: () => Promise.resolve(null) };

  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['ethereum'] = wallet;
    TestBed.configureTestingModule({ providers: [provideEther()] });
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['ethereum'];
  });

  it('reads the wallet from window in a browser', () => {
    jest.mocked(isBrowser).mockReturnValue(true);

    expect(TestBed.inject(ETHER_TOKEN)).toBe(wallet);
  });

  it('does not read window on a browser platform without window', () => {
    jest.mocked(isBrowser).mockReturnValue(false);

    expect(TestBed.inject(ETHER_TOKEN)).toBeUndefined();
    expect(TestBed.inject(ETHER_TOKEN_IS_WALLET_INSTALLED)).toBe(false);
  });
});
