import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  catchError,
  from,
  Observable,
  ObservableInput,
  ObservedValueOf,
  of,
  throwError,
} from 'rxjs';

import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { ACustomContract } from './ether-contract-custom.class';

type TEtherContractFnResult = ObservableInput<unknown>;

// Names of the custom contract methods returning an Observable or a Promise
// (the string index signature of ACustomContract is left out, so only declared methods are accepted)
type TEtherContractFnName<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : T[K] extends (...args: never[]) => TEtherContractFnResult
        ? K
        : never]: T[K];
};

// The pipe arguments are passed to the method as one array: its first parameter
type TEtherContractFnArgs<F> = F extends (args: infer A, ...rest: never[]) => unknown
  ? A extends unknown[] ? A : []
  : [];

// Value emitted by the Observable or resolved by the Promise returned by the method
type TEtherContractFnValue<F> = F extends (...args: never[]) => infer R
  ? ObservedValueOf<R>
  : never;

// Impure like AsyncPipe, so the values emitted after the first change detection are displayed
@Pipe({
  name: 'etherContractFnAsync',
  pure: false,
})
export class EtherContractFnAsyncPipe implements OnDestroy, PipeTransform {
  // AsyncPipe injects internally since Angular 20, it must be created in an injection context
  private readonly _asyncPipe: AsyncPipe = new AsyncPipe(
    inject(ChangeDetectorRef)
  );

  // The last call, so the method is only called again when the contract, method or arguments change
  private _lastCall: {
    contract: ACustomContract;
    method: PropertyKey;
    args: unknown[];
    result: TEtherContractFnResult;
  } | null = null;

  ngOnDestroy(): void {
    this._asyncPipe.ngOnDestroy();
  }

  // The method is called on the contract, so it keeps its this; the pipe arguments are passed as one array
  transform<T extends ACustomContract, K extends TEtherContractFnName<T>>(
    contract: T,
    method: K,
    ...args: TEtherContractFnArgs<T[K]>
  ): TEtherContractFnValue<T[K]> | null {
    if (!this._isLastCall(contract, method, args)) {
      const fn = contract[method] as unknown as (
        args: TEtherContractFnArgs<T[K]>
      ) => TEtherContractFnResult;

      // Without wallet there is nothing to display yet: the pipe returns null instead of throwing
      const result: Observable<unknown> = from(fn.call(contract, args)).pipe(
        catchError((error: unknown) =>
          error instanceof EtherWalletNotInstalledError
            ? of(null)
            : throwError(() => error)
        )
      );

      this._lastCall = { contract, method, args, result };
    }

    return this._asyncPipe.transform(
      this._lastCall?.result as Observable<TEtherContractFnValue<T[K]>>
    );
  }

  private _isLastCall(
    contract: ACustomContract,
    method: PropertyKey,
    args: unknown[]
  ): boolean {
    return (
      !!this._lastCall &&
      this._lastCall.contract === contract &&
      this._lastCall.method === method &&
      this._lastCall.args.length === args.length &&
      this._lastCall.args.every((arg: unknown, index: number) => arg === args[index])
    );
  }
}
