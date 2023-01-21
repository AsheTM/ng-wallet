import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ethers } from 'ethers';

import { EtherContractFnAsyncPipe } from './ether-contract-fn-async.pipe';
import { AEtherContract } from './ether-contract.class';
import { EtherNetworkService } from './ether-network.service';

import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { EtherTransactionService } from './ether-transaction.service';
import { EtherWalletService } from './ether-wallet.service';
import {
  ETHER_TOKEN,
  ETHER_TOKEN_ABI,
  ETHER_TOKEN_ADDRESS_CONTRACT,
  ETHER_TOKEN_IS_METAMASK_WALLET,
  ETHER_TOKEN_IS_WALLET_INSTALLED
} from './ether.token';
import { TEtherConfigurationRoot } from './ether.type';


@NgModule({
  declarations: [EtherContractFnAsyncPipe],
  exports: [EtherContractFnAsyncPipe],
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
      provide: AEtherContract,
      useFactory: (
        addressContract: TEtherConfigurationRoot['addressContract'],
        abi: TEtherConfigurationRoot['abi'],
        signer: AEtherSigner
      ) => new ethers.Contract(addressContract, abi, signer),
      deps: [
        ETHER_TOKEN_ADDRESS_CONTRACT,
        ETHER_TOKEN_ABI,
        AEtherSigner
      ]
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
