import { isPlatformBrowser } from "@angular/common";
import { inject, InjectionToken, PLATFORM_ID } from "@angular/core";

import { EEtherInstance/*, EEtherNetwork*/ } from "./ether.enum";
import { ETHER_DEFAULT_PRICE_FEED } from "./ether-price-feed.constant";
import { TEtherConfigurationRoot, TEtherPriceFeed } from "./ether.type";
// import { TEtherSupportedNetwork } from "./ether.type";


export const ETHER_TOKEN: InjectionToken<any>
  = new InjectionToken<any>('ETHER_TOKEN', {
    // window does not exist with server-side rendering, the server then behaves as a browser without wallet
    factory: () => isPlatformBrowser(inject(PLATFORM_ID)) ? (window as any).ethereum : undefined,
    providedIn: 'root'
  });
export const ETHER_TOKEN_ABI: InjectionToken<TEtherConfigurationRoot['abi']>
  = new InjectionToken<TEtherConfigurationRoot['abi']>('ETHER_TOKEN_ABI');

export const ETHER_TOKEN_ADDRESS_CONTRACT: InjectionToken<TEtherConfigurationRoot['addressContract']>
  = new InjectionToken<TEtherConfigurationRoot['addressContract']>('ETHER_TOKEN_ADDRESS_CONTRACT');

export const ETHER_TOKEN_INSTANCE: InjectionToken<EEtherInstance>
  = new InjectionToken<EEtherInstance>('ETHER_TOKEN_INSTANCE');

export const ETHER_TOKEN_IS_METAMASK_WALLET: InjectionToken<boolean>
= new InjectionToken<boolean>('ETHER_TOKEN_IS_METAMASK_WALLET');

export const ETHER_TOKEN_IS_WALLET_INSTALLED: InjectionToken<boolean>
  = new InjectionToken<boolean>('ETHER_TOKEN_IS_WALLET_INSTALLED');

export const ETHER_TOKEN_NETWORK_ID: InjectionToken<TEtherConfigurationRoot['networkId']>
  = new InjectionToken<TEtherConfigurationRoot['networkId']>('ETHER_TOKEN_NETWORK_ID');

export const ETHER_TOKEN_PRICE_FEED: InjectionToken<Readonly<TEtherPriceFeed>>
  = new InjectionToken<Readonly<TEtherPriceFeed>>('ETHER_TOKEN_PRICE_FEED', {
    factory: () => ETHER_DEFAULT_PRICE_FEED,
    providedIn: 'root'
  });

// export const ETHER_TOKEN_NETWORKS: InjectionToken<TEtherSupportedNetwork>
//   = new InjectionToken<TEtherSupportedNetwork>('ETHER_TOKEN_SUPPORTED_NETWORKS', {
//     factory:    () => Object.freeze({
//       0x1:    EEtherNetwork.MAIN,
//       0x2a:   EEtherNetwork.KOVAN,
//       0x3:    EEtherNetwork.ROPSTAN,
//       0x4:    EEtherNetwork.RINKEBY,
//       0x5:    EEtherNetwork.GOERLI,
//       0x539:  EEtherNetwork.LOCALHOST
//     }),
//     providedIn: 'root'
//   });
