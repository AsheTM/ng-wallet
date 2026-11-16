import { TestBed } from '@angular/core/testing';
import { TransactionReceipt, TransactionResponse } from 'ethers';
import { lastValueFrom, of, toArray } from 'rxjs';

import { ETHER_TOKEN } from '../core/ether.token';
import { provideEther } from '../ether.providers';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { EtherTransactionService } from './ether-transaction.service';
import { TEtherTransactionState, trackTransaction } from './ether-transaction.lifecycle';

const hash = '0x01';
const receipt = { status: 1 } as TransactionReceipt;
const states = (source: Parameters<typeof trackTransaction>[0], confirmations?: number) =>
  lastValueFrom(trackTransaction(source, { confirmations }).pipe(toArray()));
const response = (wait: () => Promise<TransactionReceipt | null>) =>
  ({ hash, wait: jest.fn(wait) }) as unknown as TransactionResponse;

describe('trackTransaction', () => {
  it('emits pending, submitted and confirmed', async () => {
    expect(await states(of(response(() => Promise.resolve(receipt))))).toEqual<TEtherTransactionState[]>([
      { status: 'pending' },
      { status: 'submitted', hash },
      { status: 'confirmed', hash, receipt },
    ]);
  });

  it('calls a function source on subscription only', async () => {
    const call = jest.fn(() => Promise.resolve(response(() => Promise.resolve(receipt))));
    const states$ = trackTransaction(call);

    expect(call).not.toHaveBeenCalled();

    await lastValueFrom(states$);

    expect(call).toHaveBeenCalledTimes(1);
  });

  it('waits for the given confirmations, and not at all with 0', async () => {
    const confirmed: TransactionResponse = response(() => Promise.resolve(receipt));
    const submitted: TransactionResponse = response(() => Promise.resolve(receipt));

    await states(of(confirmed), 3);
    const submittedStates: TEtherTransactionState[] = await states(of(submitted), 0);

    expect(confirmed.wait).toHaveBeenCalledWith(3);
    expect(submitted.wait).not.toHaveBeenCalled();
    expect(submittedStates.at(-1)).toEqual({ status: 'submitted', hash });
  });

  it('fails without hash when the user rejects the transaction', async () => {
    const error = new Error('user rejected action');

    expect(await states(() => Promise.reject(error))).toEqual<TEtherTransactionState[]>([
      { status: 'pending' },
      { status: 'failed', error },
    ]);
  });

  it('fails with the hash when the transaction is reverted', async () => {
    const error = new Error('transaction execution reverted');

    expect((await states(of(response(() => Promise.reject(error))))).at(-1)).toEqual({
      status: 'failed',
      error,
      hash,
    });
  });

  it('fails with EtherWalletNotInstalledError without wallet', async () => {
    TestBed.configureTestingModule({
      providers: [provideEther(), { provide: ETHER_TOKEN, useValue: undefined }],
    });
    const transfer = TestBed.inject(EtherTransactionService)
      .prepareTransaction('0x0000000000000000000000000000000000000001')
      .sendEth(0.1);
    const last = (await states(transfer)).at(-1);

    expect(last?.status).toBe('failed');
    expect(last?.status === 'failed' && last.error).toBeInstanceOf(EtherWalletNotInstalledError);
  });
});
