import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EtherContractFnAsyncPipe } from './contract/ether-contract-fn-async.pipe';


// Services and tokens are registered by provideEther(), which EtherModule.forRoot() adds
@NgModule({
  exports: [EtherContractFnAsyncPipe],
  imports: [CommonModule, EtherContractFnAsyncPipe]
})
export class EtherRootModule { }
