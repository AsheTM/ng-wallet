import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ethers } from 'ethers';
import { EtherNetworkService } from './ether-network.service';

import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { EtherTransactionService } from './ether-transaction.service';
import { EtherWalletService } from './ether-wallet.service';
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
    }, {
      provide: AEtherSigner,
      useFactory: (etherProvider: AEtherProvider) => etherProvider.getSigner(),
      deps: [AEtherProvider]
    },
    EtherNetworkService,
    EtherTransactionService,
    EtherWalletService
  ]
})
export class EtherRootModule { }
