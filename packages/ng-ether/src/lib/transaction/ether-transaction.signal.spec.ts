import { Component, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TransactionReceipt, TransactionResponse } from 'ethers';
import { Subject } from 'rxjs';

import { injectTransaction, TEtherTransactionTracker } from './ether-transaction.signal';

const receipt = { status: 1 } as TransactionReceipt;
const response = (hash: string) =>
  ({ hash, wait: () => Promise.resolve(receipt) }) as unknown as TransactionResponse;
// Lets the promise of wait() resolve
const flush = () => new Promise((resolve) => setTimeout(resolve));

@Component({ template: '' })
class HostComponent {
  readonly transaction: TEtherTransactionTracker = injectTransaction();
}

describe('injectTransaction', () => {
  let transaction: TEtherTransactionTracker;

  beforeEach(() => {
    transaction = TestBed.createComponent(HostComponent).componentInstance.transaction;
  });

  it('starts without state, then follows the tracked transaction', async () => {
    const response$ = new Subject<TransactionResponse>();

    expect(transaction.state()).toBeUndefined();

    transaction.track(response$);

    expect(transaction.state()).toEqual({ status: 'pending' });

    response$.next(response('0x01'));

    expect(transaction.state()).toEqual({ status: 'submitted', hash: '0x01' });

    await flush();

    expect(transaction.state()).toEqual({ status: 'confirmed', hash: '0x01', receipt });
  });

  it('replaces the previous transaction', () => {
    const first$ = new Subject<TransactionResponse>();
    const second$ = new Subject<TransactionResponse>();

    transaction.track(first$);
    transaction.track(second$);
    first$.next(response('0x01'));

    expect(transaction.state()).toEqual({ status: 'pending' });
    expect(first$.observed).toBe(false);
  });

  it('resets the state', () => {
    const response$ = new Subject<TransactionResponse>();

    transaction.track(response$);
    transaction.reset();

    expect(transaction.state()).toBeUndefined();
    expect(response$.observed).toBe(false);
  });

  it('stops tracking when the component is destroyed', () => {
    const fixture = TestBed.createComponent(HostComponent);
    const response$ = new Subject<TransactionResponse>();

    fixture.componentInstance.transaction.track(response$);
    fixture.destroy();

    expect(response$.observed).toBe(false);
  });

  it('needs an injection context, or an injector', () => {
    expect(() => injectTransaction()).toThrow();
    expect(injectTransaction({ injector: TestBed.inject(Injector) }).state()).toBeUndefined();
  });
});
