import { Inject, ModuleWithProviders, NgModule } from '@angular/core';

import { EtherRootModule } from './ether-root.module';
import { EEtherInstance } from './ether.enum';
import { ETHER_TOKEN_INSTANCE } from './ether.token';


@NgModule({
  providers: [{
    provide:  ETHER_TOKEN_INSTANCE,
    useValue: EEtherInstance.NO_STATIC_FOR_ROOT_METHOD_INVOKED
  }]
})
export class EtherModule {

  constructor(
    @Inject(ETHER_TOKEN_INSTANCE)
      private readonly _etherInstance: EEtherInstance
  ) {
    if(_etherInstance === EEtherInstance.NO_STATIC_FOR_ROOT_METHOD_INVOKED) {
      throw new Error(`'${this.constructor.name}.forRoot' static method must be called`);
    }
  }

  static forRoot(): ModuleWithProviders<EtherRootModule> {
    return {
      ngModule: EtherRootModule,
      providers: [
        {
          provide: ETHER_TOKEN_INSTANCE,
          useValue: EEtherInstance.FOR_ROOT
        }
      ]
    };
  }

}
