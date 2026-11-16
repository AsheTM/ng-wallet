import { EnvironmentProviders, inject, makeEnvironmentProviders, Provider } from '@angular/core';
import type { Nullable } from '@ashetm/types';
import { ethers } from 'ethers';

import { AEtherContract } from './contract/ether-contract.class';
import { EtherNetworkService } from './network/ether-network.service';
import { AEtherProvider } from './core/ether-provider.class';
import { AEtherSigner, EtherSigner } from './core/ether-signer.class';
import { EtherTransactionService } from './transaction/ether-transaction.service';
import { EtherWalletNotInstalledError } from './wallet/ether-wallet-not-installed.error';
import { EtherWalletService } from './wallet/ether-wallet.service';
import {
  ETHER_TOKEN,
  ETHER_TOKEN_ABI,
  ETHER_TOKEN_ADDRESS_CONTRACT,
  ETHER_TOKEN_EXPLORER,
  ETHER_TOKEN_IS_METAMASK_WALLET,
  ETHER_TOKEN_IS_WALLET_INSTALLED,
  ETHER_TOKEN_NETWORK_ID,
  ETHER_TOKEN_PRICE_FEED
} from './core/ether.token';
import { ETHER_DEFAULT_EXPLORER } from './network/ether-explorer.constant';
import { ETHER_DEFAULT_PRICE_FEED } from './network/ether-price-feed.constant';
import { TEtherConfigurationRoot } from './core/ether.type';


// Without wallet, ethers can only fail with a generic error: the functions of the contract reject with
// an EtherWalletNotInstalledError instead, like the services
function withoutWallet(contract: ethers.Contract): ethers.Contract {
  return new Proxy(contract, {
    get: (target: ethers.Contract, property: string | symbol, receiver: unknown) =>
      typeof property === 'string' && target.interface.hasFunction(property)
        ? () => Promise.reject(new EtherWalletNotInstalledError())
        : Reflect.get(target, property, receiver)
  });
}

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
      provide: ETHER_TOKEN_PRICE_FEED,
      useValue: Object.freeze({ ...ETHER_DEFAULT_PRICE_FEED, ...configuration?.priceFeed })
    }, {
      provide: ETHER_TOKEN_EXPLORER,
      useValue: Object.freeze({ ...ETHER_DEFAULT_EXPLORER, ...configuration?.explorers })
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
        const etherProvider: Nullable<AEtherProvider> = inject(AEtherProvider);

        return etherProvider ? new EtherSigner(etherProvider) : null;
      }
    }, {
      provide: AEtherContract,
      useFactory: () => {
        const signer: Nullable<AEtherSigner> = inject(AEtherSigner);
        const contract: ethers.Contract = new ethers.Contract(
          inject(ETHER_TOKEN_ADDRESS_CONTRACT),
          inject(ETHER_TOKEN_ABI),
          signer
        );

        return signer ? contract : withoutWallet(contract);
      }
    },
    EtherNetworkService,
    EtherTransactionService,
    EtherWalletService
  ]);
}
