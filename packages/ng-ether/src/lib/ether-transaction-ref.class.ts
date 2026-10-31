import { ethers } from 'ethers';
import { from, Observable } from 'rxjs';

import { AEtherSigner } from './ether-signer.class';
import {
  TEtherTransactionRequest,
  TEtherTransactionResponse,
} from './ether-transaction.type';

export class EtherTransactionRef {
  constructor(
    private readonly _aEtherSigner: AEtherSigner,
    private readonly _accountAddress: string
  ) {}

  sendEth(amount: number): Observable<TEtherTransactionResponse> {
    return this._send(amount, 'ether');
  }

  sendGWei(amount: number): Observable<TEtherTransactionResponse> {
    return this._send(amount, 'gwei');
  }

  sendKWei(amount: number): Observable<TEtherTransactionResponse> {
    return this._send(amount, 'kwei');
  }

  sendWei(amount: number): Observable<TEtherTransactionResponse> {
    return this._send(amount, 'wei');
  }

  private _send(
    amount: number,
    unit: 'wei' | 'kwei' | 'gwei' | 'ether'
  ): Observable<TEtherTransactionResponse> {
    const value: string = ethers.utils.parseUnits(amount + '', unit).toString();
    const transaction: TEtherTransactionRequest = {
      chainId: this._aEtherSigner.getChainId(),
      from: this._aEtherSigner.getAddress(),
      to: this._accountAddress,
      value,
    };

    return from(this._aEtherSigner.sendTransaction(transaction));
  }
}
