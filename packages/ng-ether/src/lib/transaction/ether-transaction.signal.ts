import { DestroyRef, inject, Signal, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { runInEtherInjectionContext, TEtherInjectOptions } from '../core/ether-injection';
import {
  TEtherTransactionOptions,
  TEtherTransactionSource,
  TEtherTransactionState,
  trackTransaction,
} from './ether-transaction.lifecycle';

export type TEtherTransactionTracker = {
  // State of the tracked transaction, undefined before the first track()
  readonly state: Signal<TEtherTransactionState | undefined>;
  // Tracks a transaction, and stops tracking the previous one
  track(source: TEtherTransactionSource, options?: TEtherTransactionOptions): void;
  // Stops tracking, and sets the state back to undefined
  reset(): void;
};

// Stopping the tracking (track again, reset or destroy) does not cancel a transaction already sent
export function injectTransaction(options?: TEtherInjectOptions): TEtherTransactionTracker {
  return runInEtherInjectionContext(injectTransaction, options, () => {
    const state = signal<TEtherTransactionState | undefined>(undefined);
    let subscription: Subscription | undefined;

    inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());

    return {
      state: state.asReadonly(),
      track: (source: TEtherTransactionSource, trackOptions?: TEtherTransactionOptions) => {
        subscription?.unsubscribe();
        subscription = trackTransaction(source, trackOptions).subscribe(
          (transactionState: TEtherTransactionState) => state.set(transactionState)
        );
      },
      reset: () => {
        subscription?.unsubscribe();
        state.set(undefined);
      },
    };
  });
}
