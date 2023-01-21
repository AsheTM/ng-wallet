import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { TContractFunction } from './ether-contract-custom.type';


@Pipe({
  name: 'etherContractFnAsync'
})
export class EtherContractFnAsyncPipe implements PipeTransform {

  constructor(private readonly _changeDetectionRef: ChangeDetectorRef) { }

  transform(fn: TContractFunction, ...args: any[]): any {
    return new AsyncPipe(this._changeDetectionRef).transform((fn as ((...args: any[]) => Observable<any>))(args));
  }

}
