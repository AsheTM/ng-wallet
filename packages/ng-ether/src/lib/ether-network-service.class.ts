import { Observable } from "rxjs";

import { AEtherService } from "./ether-service.class";
import { TEtherBigNumber, TEtherNetwork, TEtherNetworkChange } from "./ether.type";


export abstract class AEtherNetworkService extends AEtherService {

  abstract readonly blockNumber$: Observable<number>;
  abstract readonly gasFee$: Observable<TEtherBigNumber>;
  abstract readonly network$: Observable<TEtherNetwork>;
  abstract readonly price$: Observable<number>;

  abstract onNetworkChange(): Observable<TEtherNetworkChange>;
  abstract onNetworkChange(fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void): void;

}
