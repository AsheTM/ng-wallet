import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { TransactionReceipt, TransactionResponse } from 'ethers';
import { Subject } from 'rxjs';

import { withEtherTransaction } from './with-ether-transaction';

const receipt = { status: 1 } as TransactionReceipt;
const response = (hash: string) =>
  ({ hash, wait: () => Promise.resolve(receipt) }) as unknown as TransactionResponse;
// Lets the promise of wait() resolve
const flush = () => new Promise((resolve) => setTimeout(resolve));

const TransferStore = signalStore(withEtherTransaction());

@Component({ template: '', providers: [TransferStore] })
class HostComponent {
  readonly store = inject(TransferStore);
}

describe('withEtherTransaction', () => {
  let store: InstanceType<typeof TransferStore>;

  beforeEach(() => {
    store = TestBed.createComponent(HostComponent).componentInstance.store;
  });

  it('starts without transaction, then follows the tracked one', async () => {
    const response$ = new Subject<TransactionResponse>();

    expect(store.transaction()).toBeUndefined();

    store.trackTransaction(response$);

    expect(store.transaction()).toEqual({ status: 'pending' });

    response$.next(response('0x01'));

    expect(store.transaction()).toEqual({ status: 'submitted', hash: '0x01' });

    await flush();

    expect(store.transaction()).toEqual({ status: 'confirmed', hash: '0x01', receipt });
  });

  it('passes the options', () => {
    const response$ = new Subject<TransactionResponse>();

    store.trackTransaction(response$, { confirmations: 0 });
    response$.next(response('0x01'));

    expect(store.transaction()).toEqual({ status: 'submitted', hash: '0x01' });
  });

  it('replaces the previous transaction', () => {
    const first$ = new Subject<TransactionResponse>();
    const second$ = new Subject<TransactionResponse>();

    store.trackTransaction(first$);
    store.trackTransaction(second$);

    expect(first$.observed).toBe(false);
    expect(second$.observed).toBe(true);
  });

  it('resets the transaction', () => {
    const response$ = new Subject<TransactionResponse>();

    store.trackTransaction(response$);
    store.resetTransaction();

    expect(store.transaction()).toBeUndefined();
    expect(response$.observed).toBe(false);
  });

  it('stops tracking when the store is destroyed', () => {
    const fixture = TestBed.createComponent(HostComponent);
    const response$ = new Subject<TransactionResponse>();

    fixture.componentInstance.store.trackTransaction(response$);
    fixture.destroy();

    expect(response$.observed).toBe(false);
  });
});
