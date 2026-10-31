import { inject, Injectable, TypeDecorator } from "@angular/core";

import { ACustomContract } from "./ether-contract-custom.class";
import { AEtherContract } from "./ether-contract.class";


export function ContractInjectable(): TypeDecorator {
  return function<T extends { new (...args: any[]): { } & ACustomContract }>(target: T): T {
    // Provided in root so it works with both provideEther() and EtherModule.forRoot()
    @Injectable({
      providedIn: 'root',
      useFactory: () => new CustomSmartContract(inject(AEtherContract))
    })
    class CustomSmartContract extends target { }

    return CustomSmartContract;
  };
};
