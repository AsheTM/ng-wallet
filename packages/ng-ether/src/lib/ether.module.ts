import { inject, ModuleWithProviders, NgModule } from '@angular/core';

import { EtherRootModule } from './ether-root.module';
import { EEtherInstance } from './ether.enum';
import { provideEther } from './ether.providers';
import { ETHER_TOKEN_INSTANCE } from './ether.token';
import { TEtherConfigurationRoot } from './ether.type';

/**
 * @deprecated Use `provideEther()` in the application providers and import `EtherContractFnAsyncPipe` where needed
 */
@NgModule({
  providers: [
    {
      provide: ETHER_TOKEN_INSTANCE,
      useValue: EEtherInstance.NO_STATIC_FOR_ROOT_METHOD_INVOKED,
    },
  ],
})
export class EtherModule {
  constructor() {
    if (inject(ETHER_TOKEN_INSTANCE) === EEtherInstance.NO_STATIC_FOR_ROOT_METHOD_INVOKED) {
      throw new Error(
        `'${this.constructor.name}.forRoot' static method must be called`
      );
    }
  }

  /**
   * @deprecated Use `provideEther()` in the application providers instead
   */
  static forRoot(
    configuration?: TEtherConfigurationRoot
  ): ModuleWithProviders<EtherRootModule> {
    return {
      ngModule: EtherRootModule,
      providers: [
        {
          provide: ETHER_TOKEN_INSTANCE,
          useValue: EEtherInstance.FOR_ROOT,
        },

        provideEther(configuration),
      ],
    };
  }
}
