import {
  injectTransaction,
  TEtherTransactionOptions,
  TEtherTransactionSource,
} from '@ashetm/ng-ether';
import { signalStoreFeature, withComputed, withMethods, withProps } from '@ngrx/signals';

// A transaction in a SignalStore: its state in transaction, tracked with trackTransaction().
// Stopping the tracking (track again, reset or store destroyed) does not cancel a transaction already sent
export function withEtherTransaction() {
  return signalStoreFeature(
    // Private to the store (prefixed with _)
    withProps(() => ({ _transactionTracker: injectTransaction() })),
    withComputed(({ _transactionTracker }) => ({
      // undefined before the first trackTransaction(), then pending, submitted, confirmed or failed
      transaction: _transactionTracker.state,
    })),
    withMethods(({ _transactionTracker }) => ({
      // Tracks a transfer or a contract call, and stops tracking the previous one
      trackTransaction(source: TEtherTransactionSource, options?: TEtherTransactionOptions): void {
        _transactionTracker.track(source, options);
      },
      // Stops tracking, and sets transaction back to undefined
      resetTransaction(): void {
        _transactionTracker.reset();
      },
    }))
  );
}
