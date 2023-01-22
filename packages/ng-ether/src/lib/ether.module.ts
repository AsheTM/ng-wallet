import { Inject, ModuleWithProviders, NgModule, Provider } from '@angular/core';

import { EtherRootModule } from './ether-root.module';
import { EEtherInstance } from './ether.enum';
import { ETHER_TOKEN_ABI, ETHER_TOKEN_ADDRESS_CONTRACT, ETHER_TOKEN_INSTANCE, ETHER_TOKEN_NETWORK_ID } from './ether.token';
import { TEtherConfigurationRoot } from './ether.type';


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

  static forRoot(configuration?: TEtherConfigurationRoot): ModuleWithProviders<EtherRootModule> {
    let extraProviders: Provider[] = [];

    if(configuration) {
      const {
        addressContract,
        abi,
        networkId
      }: TEtherConfigurationRoot = configuration;

      extraProviders = [
        ...extraProviders,
        {
          provide: ETHER_TOKEN_ADDRESS_CONTRACT,
          useValue: addressContract
        }, {
          provide: ETHER_TOKEN_ABI,
          useValue: abi
        }, {
          provide: ETHER_TOKEN_NETWORK_ID,
          useValue: networkId || 'any'
        }
      ];
    }

    return {
      ngModule: EtherRootModule,
      providers: [
        {
          provide: ETHER_TOKEN_INSTANCE,
          useValue: EEtherInstance.FOR_ROOT
        },

        ...extraProviders
      ]
    };
  }

}
