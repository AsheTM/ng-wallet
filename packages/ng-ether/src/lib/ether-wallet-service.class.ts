import { Observable } from "rxjs";

import { AEtherService } from "./ether-service.class";
import { TEtherBigNumber } from "./ether.type";


export abstract class AEtherWalletService extends AEtherService {

  abstract readonly account$: Observable<string>;
  abstract readonly balance$: Observable<TEtherBigNumber>;
  abstract readonly transactionCount$: Observable<number>;

  abstract connectWallet(): Observable<string[]>;
  abstract getBalanceOf(addressWallet: string): Observable<TEtherBigNumber>;
  abstract getTransactionCountOf(addressWallet: string): Observable<number>;
  abstract onAccountChange(): Observable<string[]>;
  abstract onAccountChange(fn: (accounts: string[]) => void): void;
  abstract onConnect(): Observable<boolean>;
  abstract onConnect(fn: (isConnect: boolean) => void): void;
  abstract onDisconnect(): Observable<void>;
  abstract onDisconnect(fn: () => void): void;

}
