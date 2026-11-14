import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { Observable, ObservableInput, ObservedValueOf } from 'rxjs';

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

@Pipe({
  name: 'etherContractFnAsync',
})
export class EtherContractFnAsyncPipe implements OnDestroy, PipeTransform {
  // AsyncPipe injects internally since Angular 20, it must be created in an injection context
  private readonly _asyncPipe: AsyncPipe = new AsyncPipe(
    inject(ChangeDetectorRef)
  );

  ngOnDestroy(): void {
    this._asyncPipe.ngOnDestroy();
  }

  // The method is called on the contract, so it keeps its this; the pipe arguments are passed as one array
  transform<T extends ACustomContract, K extends TEtherContractFnName<T>>(
    contract: T,
    method: K,
    ...args: TEtherContractFnArgs<T[K]>
  ): TEtherContractFnValue<T[K]> | null {
    const fn = contract[method] as unknown as (
      args: TEtherContractFnArgs<T[K]>
    ) => TEtherContractFnResult;

    return this._asyncPipe.transform(
      fn.call(contract, args) as Observable<TEtherContractFnValue<T[K]>>
    );
  }
}
