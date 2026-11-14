import { ethers } from "ethers";

import { AEtherProvider } from "./ether-provider.class";

export abstract class AEtherSigner extends ethers.AbstractSigner<AEtherProvider> { }

// ethers v6 resolves the wallet signer asynchronously, so every call asks the provider for the current account
export class EtherSigner extends AEtherSigner {

  connect(provider: null | ethers.Provider): ethers.Signer {
    if(!(provider instanceof ethers.BrowserProvider)) {
      throw new Error(`'${this.constructor.name}' can only be connected to a BrowserProvider`);
    }

    return new EtherSigner(provider as AEtherProvider);
  }

  async getAddress(): Promise<string> {
    return (await this._getSigner()).getAddress();
  }

  async sendTransaction(transaction: ethers.TransactionRequest): Promise<ethers.TransactionResponse> {
    return (await this._getSigner()).sendTransaction(transaction);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    return (await this._getSigner()).signMessage(message);
  }

  async signTransaction(transaction: ethers.TransactionRequest): Promise<string> {
    return (await this._getSigner()).signTransaction(transaction);
  }

  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string> {
    return (await this._getSigner()).signTypedData(domain, types, value);
  }

  private _getSigner(): Promise<ethers.JsonRpcSigner> {
    return this.provider.getSigner();
  }

}
