import { Injectable } from '@angular/core';

import { EtherTransactionRef } from './ether-transaction-ref.class';
import { AEtherTransactionService } from './ether-transaction-service.class';


@Injectable()
export class EtherTransactionService extends AEtherTransactionService {

  prepareTransaction(addressWallet: string): EtherTransactionRef {
    return new EtherTransactionRef(this._aEtherSigner, addressWallet);
  }

}
