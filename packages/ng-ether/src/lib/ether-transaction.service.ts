import { inject, Injectable, NgZone } from '@angular/core';

import { AEtherProvider } from './ether-provider.class';
import { AEtherSigner } from './ether-signer.class';
import { EtherTransactionRef } from './ether-transaction-ref.class';
import { AEtherTransactionService } from './ether-transaction-service.class';


@Injectable()
export class EtherTransactionService extends AEtherTransactionService {

  constructor() {
    super(inject(NgZone), inject(AEtherProvider), inject(AEtherSigner));
  }

  prepareTransaction(addressWallet: string): EtherTransactionRef {
    return new EtherTransactionRef(this._aEtherSigner, addressWallet);
  }

}
