import { Injectable, Type, TypeDecorator } from "@angular/core";

import { ACustomContract } from "./ether-contract-custom.class";
import { AEtherContract } from "./ether-contract.class";


export function ContractInjectable({
  providedIn
}: {
  providedIn: Type<any> | 'root' | 'platform' | 'any' | null;
} = {
  providedIn: 'root'
}): TypeDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function<T extends { new (...args: any[]): { } & ACustomContract }>(target: T): T {
    @Injectable({
      providedIn,
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
