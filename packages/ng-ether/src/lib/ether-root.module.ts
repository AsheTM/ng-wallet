import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ethers } from 'ethers';

import { AEtherProvider } from './ether-provider.class';
import { EtherProviderService } from './ether-provider.service';
import {
  ETHER_TOKEN,
  ETHER_TOKEN_IS_METAMASK_WALLET,
  ETHER_TOKEN_IS_WALLET_INSTALLED
} from './ether.token';


@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: ETHER_TOKEN_IS_METAMASK_WALLET,
      useFactory: ({ isMetaMask }: Partial<Record<'isMetaMask', boolean>>) => !!isMetaMask,
      deps: [ETHER_TOKEN]
    }, {
      provide: ETHER_TOKEN_IS_WALLET_INSTALLED,
      useFactory: (ether: unknown) => !!ether,
      deps: [ETHER_TOKEN]
    }, {
      provide: AEtherProvider,
      useFactory: (ether: any) => new ethers.providers.Web3Provider(ether, 'any'),
      deps: [ETHER_TOKEN]
    },
    EtherProviderService
  ]
})
export class EtherRootModule { }
