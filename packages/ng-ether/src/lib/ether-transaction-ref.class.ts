import { ethers } from "ethers";
import { from, Observable } from "rxjs";

import { AEtherSigner } from "./ether-signer.class";
import { TEtherTransactionRequest, TEtherTransactionResponse } from "./ether-transaction.type";


export class EtherTransactionRef {

  constructor(
    private readonly _aEtherSigner: AEtherSigner,
    private readonly _accountAddress: string
  ) { }

  sendEth(amount: number): Observable<TEtherTransactionResponse> {
    const ethValue: string = ethers.utils.parseEther(amount + '').toString();

    return this._send(ethValue);
  }

  sendGWei(amount: number): Observable<TEtherTransactionResponse> {
    const gweiValue: string = ethers.utils.formatUnits(amount + '', 'gwei');

    return this._send(gweiValue);
  }

  sendWei(amount: number): Observable<TEtherTransactionResponse> {
    const weiValue: string = amount + '';

    return this._send(weiValue);
  }

  private _send(value: string): Observable<TEtherTransactionResponse> {
    const transaction: TEtherTransactionRequest = {
      chainId: this._aEtherSigner.getChainId(),
      from: this._aEtherSigner.getAddress(),
      to: this._accountAddress,
      value
    };

    return from(this._aEtherSigner.sendTransaction(transaction));
  }

}
