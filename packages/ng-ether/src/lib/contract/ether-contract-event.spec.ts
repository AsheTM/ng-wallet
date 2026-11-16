import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Contract, EventLog } from 'ethers';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';

import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import {
  fromContractEvent,
  onContractEvent,
  queryContractEvents,
  TEtherContractEvent,
} from './ether-contract-event';

const from = '0x0000000000000000000000000000000000000001';
const log = {
  eventName: 'Transfer',
  args: [from, '0x0000000000000000000000000000000000000002', 5n],
  blockNumber: 10,
  transactionHash: '0x01',
} as unknown as EventLog;
const event: TEtherContractEvent = {
  name: 'Transfer',
  args: log.args,
  blockNumber: 10,
  transactionHash: '0x01',
  log,
};

// Stands for an ethers Contract: emit() calls the listeners like ethers, with the arguments then the payload
function fakeContract(withProvider = true) {
  const listeners = new Map<unknown, (...args: unknown[]) => void>();
  const contract = {
    runner: withProvider ? { provider: {} } : null,
    filters: { Transfer: jest.fn((...args: unknown[]) => ({ filter: args })) },
    on: jest.fn(async (eventName: unknown, listener: (...args: unknown[]) => void) => {
      listeners.set(eventName, listener);
    }),
    off: jest.fn(async (eventName: unknown) => {
      listeners.delete(eventName);
    }),
    queryFilter: jest.fn(async () => [log, { blockNumber: 11 }]),
  };
  const emit = () => listeners.forEach((listener) => listener(...log.args, { log }));

  return { contract: contract as unknown as Contract, fake: contract, emit, listeners };
}

describe('fromContractEvent', () => {
  it('emits the new events, then removes the listener on unsubscription', async () => {
    const { contract, fake, emit, listeners } = fakeContract();
    const events: TEtherContractEvent[] = [];
    const subscription: Subscription = fromContractEvent(contract, 'Transfer').subscribe((value) =>
      events.push(value)
    );

    await Promise.resolve();
    emit();
    subscription.unsubscribe();

    expect(events).toEqual([event]);
    expect(fake.off).toHaveBeenCalledWith('Transfer', expect.any(Function));
    expect(listeners.size).toBe(0);
  });

  it('filters on the indexed arguments', () => {
    const { contract, fake } = fakeContract();

    fromContractEvent(contract, 'Transfer', { args: [from, null] }).subscribe();

    expect(fake.filters.Transfer).toHaveBeenCalledWith(from, null);
    expect(fake.on).toHaveBeenCalledWith({ filter: [from, null] }, expect.any(Function));
  });

  it('emits EtherWalletNotInstalledError without wallet', async () => {
    await expect(firstValueFrom(fromContractEvent(fakeContract(false).contract, 'Transfer'))).rejects.toBeInstanceOf(
      EtherWalletNotInstalledError
    );
  });
});

describe('queryContractEvents', () => {
  it('returns the decoded past events between two blocks', async () => {
    const { contract, fake } = fakeContract();

    expect(await lastValueFrom(queryContractEvents(contract, 'Transfer', { fromBlock: -1000, args: [from] }))).toEqual([
      event,
    ]);
    expect(fake.queryFilter).toHaveBeenCalledWith({ filter: [from] }, -1000, undefined);
  });

  it('emits EtherWalletNotInstalledError without wallet', async () => {
    await expect(
      firstValueFrom(queryContractEvents(fakeContract(false).contract, 'Transfer'))
    ).rejects.toBeInstanceOf(EtherWalletNotInstalledError);
  });
});

describe('onContractEvent', () => {
  const received = jest.fn();
  let setUp: ReturnType<typeof fakeContract>;

  @Component({ template: '' })
  class HostComponent {
    constructor() {
      onContractEvent(setUp.contract, 'Transfer', received);
    }
  }

  beforeEach(() => received.mockClear());

  it('calls the hook on each event, and stops when the component is destroyed', async () => {
    setUp = fakeContract();
    const fixture = TestBed.createComponent(HostComponent);

    await Promise.resolve();
    setUp.emit();
    fixture.destroy();
    setUp.emit();

    expect(received).toHaveBeenCalledTimes(1);
    expect(received).toHaveBeenCalledWith(event);
  });

  it('is never called without wallet', () => {
    setUp = fakeContract(false);

    expect(() => TestBed.createComponent(HostComponent)).not.toThrow();
    expect(received).not.toHaveBeenCalled();
  });
});
