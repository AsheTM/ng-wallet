import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Observable, Subscribable } from 'rxjs';


@Pipe({
  name: 'etherContractFnAsync',
  standalone: false
})
export class EtherContractFnAsyncPipe implements OnDestroy, PipeTransform {

  // AsyncPipe injects internally since Angular 20, it must be created in an injection context
  private readonly _asyncPipe: AsyncPipe;

  constructor(private readonly _changeDetectionRef: ChangeDetectorRef) {
    this._asyncPipe = new AsyncPipe(this._changeDetectionRef);
  }

  ngOnDestroy(): void {
    this._asyncPipe.ngOnDestroy();
  }

  transform(fn: (...args: any[]) => Observable<any> | Subscribable<any> | Promise<any>, ...args: any[]): any {
    return this._asyncPipe.transform(fn(args));
  }

}
