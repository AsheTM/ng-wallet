// Emitted by the ng-ether streams and methods when no wallet (window.ethereum) is available
export class EtherWalletNotInstalledError extends Error {
  constructor() {
    super('No wallet installed');
    this.name = 'EtherWalletNotInstalledError';
  }
}
