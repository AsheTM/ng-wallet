import { TContractFunction, TCustomContractFunction } from "./ether-contract-custom.type";


export abstract class ACustomContract {

  readonly [key: string]: TContractFunction;

  constructor(protected readonly contract: TCustomContractFunction) { }

}
