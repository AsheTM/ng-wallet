import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  Injector,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Observable, of } from 'rxjs';

export type TEtherInjectOptions = {
  // Injector to use outside an injection context (for example in ngOnInit)
  injector?: Injector;
};

// Runs fn in the injection context of options.injector, or asserts that the caller is in one
export function runInEtherInjectionContext<T>(
  caller: (...args: never[]) => unknown,
  options: TEtherInjectOptions | undefined,
  fn: () => T
): T {
  if (options?.injector) {
    return runInInjectionContext(options.injector, fn);
  }

  assertInInjectionContext(caller);

  return fn();
}

// A signal can not hold an error: without wallet, on the server or on error, it keeps its initial value
export function toEtherSignal<T, D>(source: Observable<T>, initialValue: D): Signal<T | D> {
  return toSignal(source.pipe(catchError(() => of(initialValue))), {
    initialValue,
  });
}

// Calls fn on each value until the injection context is destroyed, returns a function to stop earlier
export function listenInEtherInjectionContext<T>(
  source: Observable<T>,
  fn: (value: T) => void
): () => void {
  const subscription = source
    .pipe(
      catchError(() => EMPTY),
      takeUntilDestroyed(inject(DestroyRef))
    )
    .subscribe((value: T) => fn(value));

  return () => subscription.unsubscribe();
}
