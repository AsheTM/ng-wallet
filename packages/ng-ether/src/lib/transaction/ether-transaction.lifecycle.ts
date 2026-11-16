import { TransactionReceipt, TransactionResponse } from 'ethers';
import {
  catchError,
  concat,
  defer,
  EMPTY,
  from,
  isObservable,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';

export type TEtherTransactionState =
  // Waiting for the wallet signature
  | { status: 'pending' }
  // Sent, waiting to be mined
  | { status: 'submitted'; hash: string }
  | { status: 'confirmed'; hash: string; receipt: TransactionReceipt }
  // Rejected by the user or the wallet (without hash), or reverted (with hash)
  | { status: 'failed'; error: unknown; hash?: string };

export type TEtherTransactionSource =
  | Observable<TransactionResponse>
  | (() => Promise<TransactionResponse> | Observable<TransactionResponse>);

export type TEtherTransactionOptions = {
  // Blocks to wait for before confirmed, 1 by default; 0 completes once submitted
  confirmations?: number;
};

// Emits the states of a transfer or a contract call, then completes; a failure is a state, not an error.
// A function source is only called on subscription, so the pending state comes before the wallet request
export function trackTransaction(
  source: TEtherTransactionSource,
  options?: TEtherTransactionOptions
): Observable<TEtherTransactionState> {
  const confirmations: number = options?.confirmations ?? 1;

  return defer(() => {
    let hash: string | undefined;
    const response$: Observable<TransactionResponse> = isObservable(source)
      ? source
      : defer(() => {
          const response = source();

          return isObservable(response) ? response : from(response);
        });

    return concat(
      of<TEtherTransactionState>({ status: 'pending' }),
      response$.pipe(
        take(1),
        switchMap((response: TransactionResponse) => {
          const submittedHash: string = response.hash;

          hash = submittedHash;

          return concat(
            of<TEtherTransactionState>({ status: 'submitted', hash: submittedHash }),
            confirmations > 0
              ? from(response.wait(confirmations)).pipe(
                  switchMap((receipt: TransactionReceipt | null) =>
                    receipt
                      ? of<TEtherTransactionState>({ status: 'confirmed', hash: submittedHash, receipt })
                      : EMPTY
                  )
                )
              : EMPTY
          );
        })
      )
    ).pipe(
      catchError((error: unknown) =>
        of<TEtherTransactionState>(
          hash ? { status: 'failed', error, hash } : { status: 'failed', error }
        )
      )
    );
  });
}
