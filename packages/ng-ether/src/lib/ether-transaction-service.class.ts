import { AEtherService } from "./ether-service.class";
import { EtherTransactionRef } from "./ether-transaction-ref.class";


export abstract class AEtherTransactionService extends AEtherService {

  abstract prepareTransaction(addressWallet: string): EtherTransactionRef;

}
