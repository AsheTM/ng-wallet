import { NgModule } from "@angular/core";

import { EtherModule } from "./ether.module";
import { ETHER_TOKEN } from "./ether.token";

import * as abiMock from '../assets/abi.mock.json';


@NgModule({
  exports: [EtherModule],
  imports: [EtherModule.forRoot({
    abi: abiMock,
    addressContract: '0x0'
  })],
  providers: [{
    provide: ETHER_TOKEN,
    useFactory: () => ({
      chainId: 0x1,
      enable: () => void 0,
      isMetaMask: true,
      networkVersion: "1",
      request: () => void 0,
      selectedAddress: "0x123456789123456789",
      send: () => void 0,
      sendAsync: () => void 0
    })
  }]
})
export class EtherTestModule { }
