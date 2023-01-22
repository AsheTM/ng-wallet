import { Observable } from "rxjs";

import { EEtherNetworkChainId } from "./ether-network.enum";
import { AEtherService } from "./ether-service.class";
import { TEtherNetwork, TEtherNetworkChange } from './ether-network.type';
import { TEtherBigNumber, TEtherError } from "./ether.type";


export abstract class AEtherNetworkService extends AEtherService {

  abstract readonly blockNumber$: Observable<number>;
  abstract readonly gasFee$: Observable<TEtherBigNumber>;
  abstract readonly network$: Observable<TEtherNetwork>;
  abstract readonly price$: Observable<number>;

  abstract addNetwork(newNetwork: TEtherNetwork): Observable<true | TEtherError>;
  abstract onNetworkChange(): Observable<TEtherNetworkChange>;
  abstract onNetworkChange(fn: (newNetwork: TEtherNetwork, oldNetwork?: TEtherNetwork) => void): void;
  abstract switchNetwork(chainId: EEtherNetworkChainId): Observable<true | TEtherError>;

}
