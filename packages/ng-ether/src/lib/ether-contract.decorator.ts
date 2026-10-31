import { Injectable, TypeDecorator } from "@angular/core";

import { ACustomContract } from "./ether-contract-custom.class";
import { AEtherContract } from "./ether-contract.class";
import { EtherRootModule } from "./ether-root.module";


export function ContractInjectable(): TypeDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function<T extends { new (...args: any[]): { } & ACustomContract }>(target: T): T {
    @Injectable({
      providedIn: EtherRootModule,
      useFactory: (contract: AEtherContract) => new CustomSmartContract(contract),
      deps: [AEtherContract]
    })
    class CustomSmartContract extends target {

      constructor(...args: any[]) {
        super(args[0]);
      }

    }

    return CustomSmartContract;
  };
};
