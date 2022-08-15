import { InjectionToken } from "@angular/core";

import { EtherRootModule } from "./ether-root.module";
import { EEtherInstance } from "./ether.enum";


export const ETHER_TOKEN: InjectionToken<any>
  = new InjectionToken<any>('ETHER_TOKEN', {
    factory: () => (window as any).ether,
    providedIn: EtherRootModule
  });

export const ETHER_TOKEN_INSTANCE: InjectionToken<EEtherInstance>
  = new InjectionToken<EEtherInstance>('ETHER_TOKEN_INSTANCE');

export const ETHER_TOKEN_IS_METAMASK_WALLET: InjectionToken<boolean>
= new InjectionToken<boolean>('ETHER_TOKEN_IS_METAMASK_WALLET');

export const ETHER_TOKEN_IS_WALLET_INSTALLED: InjectionToken<boolean>
  = new InjectionToken<boolean>('ETHER_TOKEN_IS_WALLET_INSTALLED');
