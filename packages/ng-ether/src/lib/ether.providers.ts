import { EnvironmentProviders, inject, makeEnvironmentProviders, Provider } from '@angular/core';
import { ethers } from 'ethers';

import { AEtherContract } from './ether-contract.class';
import { EtherNetworkService } from './ether-network.service';
import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner, EtherSigner } from './ether-signer.class';
import { EtherTransactionService } from './ether-transaction.service';
import { EtherWalletService } from './ether-wallet.service';
import {
  ETHER_TOKEN,
  ETHER_TOKEN_ABI,
  ETHER_TOKEN_ADDRESS_CONTRACT,
  ETHER_TOKEN_IS_METAMASK_WALLET,
  ETHER_TOKEN_IS_WALLET_INSTALLED,
  ETHER_TOKEN_NETWORK_ID
} from './ether.token';
import { TEtherConfigurationRoot } from './ether.type';


export function provideEther(configuration?: TEtherConfigurationRoot): EnvironmentProviders {
  const defaultNetworkId: TEtherConfigurationRoot['networkId'] = 'any';
  const configurationProviders: Provider[] = configuration ? [
    {
      provide: ETHER_TOKEN_ADDRESS_CONTRACT,
      useValue: configuration.addressContract
    }, {
      provide: ETHER_TOKEN_ABI,
      useValue: configuration.abi
    }
  ] : [];

  return makeEnvironmentProviders([
    ...configurationProviders,
    {
      provide: ETHER_TOKEN_NETWORK_ID,
      useValue: configuration?.networkId || defaultNetworkId
    }, {
      provide: ETHER_TOKEN_IS_METAMASK_WALLET,
      useFactory: () => !!inject(ETHER_TOKEN)?.isMetaMask
    }, {
      provide: ETHER_TOKEN_IS_WALLET_INSTALLED,
      useFactory: () => !!inject(ETHER_TOKEN)
    }, {
      provide: AEtherProvider,
      useFactory: () => {
        const ether = inject(ETHER_TOKEN);

        return ether ? new ethers.BrowserProvider(ether, inject(ETHER_TOKEN_NETWORK_ID)) : null;
      }
    }, {
      provide: AEtherSigner,
      useFactory: () => {
        const etherProvider: AEtherProvider | null = inject(AEtherProvider);

        return etherProvider ? new EtherSigner(etherProvider) : null;
      }
    }, {
      provide: AEtherContract,
      useFactory: () => new ethers.Contract(
        inject(ETHER_TOKEN_ADDRESS_CONTRACT),
        inject(ETHER_TOKEN_ABI),
        inject(AEtherSigner)
      )
    },
    EtherNetworkService,
    EtherTransactionService,
    EtherWalletService
  ]);
}
