import { TestBed } from '@angular/core/testing';

import { EtherUnitsPipe } from './core/ether-units.pipe';
import { provideEther } from './ether.providers';
import { EtherChainNamePipe } from './network/ether-chain-name.pipe';
import { EtherExplorerLinkPipe } from './network/ether-explorer-link.pipe';
import { EtherShortAddressPipe } from './wallet/ether-short-address.pipe';

const address = '0x1234567890abcdef1234567890abcdef1234abcd';
const hash = `0x${'ab'.repeat(32)}`;

describe('etherShortAddress', () => {
  const pipe = new EtherShortAddressPipe();

  it('keeps the start and the end of an address', () => {
    expect(pipe.transform(address)).toBe('0x1234…abcd');
    expect(pipe.transform(address, 4, 2)).toBe('0x12…cd');
  });

  it('keeps short values and returns null without value', () => {
    expect(pipe.transform('0x1234')).toBe('0x1234');
    expect(pipe.transform(undefined)).toBeNull();
  });
});

describe('etherUnits', () => {
  const pipe = new EtherUnitsPipe();

  it('formats wei in ether by default, without trailing zeros', () => {
    expect(pipe.transform(1_500_000_000_000_000_000n)).toBe('1.5');
    expect(pipe.transform(10n ** 18n)).toBe('1');
  });

  it('formats in a unit or a number of decimals', () => {
    expect(pipe.transform(1_500_000_000n, 'gwei')).toBe('1.5');
    expect(pipe.transform(2_500_000n, 6)).toBe('2.5');
  });

  it('truncates to the maximum of decimals, without rounding up', () => {
    expect(pipe.transform(1_999_999_999_999_999_999n, 'ether', 2)).toBe('1.99');
  });

  it('returns null without value', () => {
    expect(pipe.transform(null)).toBeNull();
  });
});

describe('etherExplorerLink', () => {
  const create = (explorers?: Record<number, string>) => {
    TestBed.configureTestingModule({
      providers: [provideEther(explorers ? { explorers } as never : undefined)],
    });

    return TestBed.runInInjectionContext(() => new EtherExplorerLinkPipe());
  };

  it('detects addresses, transactions and blocks on Etherscan', () => {
    const pipe = create();

    expect(pipe.transform(address, 1)).toBe(`https://etherscan.io/address/${address}`);
    expect(pipe.transform(hash, 11155111n)).toBe(`https://sepolia.etherscan.io/tx/${hash}`);
    expect(pipe.transform(21_000_000, 1)).toBe('https://etherscan.io/block/21000000');
  });

  it('uses the given type', () => {
    expect(create().transform(address, 1, 'token')).toBe(`https://etherscan.io/token/${address}`);
  });

  it('uses the configured explorers', () => {
    expect(create({ 137: 'https://polygonscan.com/' }).transform(address, 137)).toBe(
      `https://polygonscan.com/address/${address}`
    );
  });

  it('returns null on a chain without explorer, or without value or chain', () => {
    const pipe = create();

    expect(pipe.transform(address, 137)).toBeNull();
    expect(pipe.transform(undefined, 1)).toBeNull();
    expect(pipe.transform(address, undefined)).toBeNull();
    expect(pipe.transform('0x12', 1)).toBeNull();
  });
});

describe('etherChainName', () => {
  const pipe = new EtherChainNamePipe();

  it('names known chains from a number, a bigint or a hexadecimal string', () => {
    expect(pipe.transform(1)).toBe('Ethereum');
    expect(pipe.transform(11155111n)).toBe('Sepolia');
    expect(pipe.transform('0x89')).toBe('Polygon');
  });

  it('names unknown chains by their ID', () => {
    expect(pipe.transform(999)).toBe('Chain 999');
    expect(pipe.transform(undefined)).toBeNull();
  });
});
