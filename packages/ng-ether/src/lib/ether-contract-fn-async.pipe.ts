import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Observable, Subscribable } from 'rxjs';


@Pipe({
  name: 'etherContractFnAsync'
})
export class EtherContractFnAsyncPipe implements PipeTransform {

  constructor(private readonly _changeDetectionRef: ChangeDetectorRef) { }

  transform(fn: (...args: any[]) => Observable<any> | Subscribable<any> | Promise<any>, ...args: any[]): any {
    return new AsyncPipe(this._changeDetectionRef).transform(fn(args));
  }

}
