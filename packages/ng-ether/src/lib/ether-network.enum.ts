
export enum EEtherNetworkChainId {
  /**
   * @deprecated Goerli was deprecated in 2023 and shut down in 2024. Use `SEPOLIA` for applications or `HOODI` for validators instead. It will be removed in the next major version.
   */
  GOERLI = 0x5,
  /**
   * Hoodi, the testnet for validators and staking providers, launched in March 2025 to replace Holesky.
   */
  HOODI = 0x88bb0,
  /**
   * @deprecated Kovan stopped working after The Merge in 2022 and is no longer maintained. Use `SEPOLIA` instead. It will be removed in the next major version.
   */
  KOVAN = 0x2a,
  LOCALHOST = 0x539,
  MAIN = 0x1,
  /**
   * @deprecated Rinkeby stopped working after The Merge in 2022 and was shut down in 2023. Use `SEPOLIA` instead. It will be removed in the next major version.
   */
  RINKEBY = 0x4,
  /**
   * @deprecated Ropsten was shut down in 2022, after The Merge. Use `SEPOLIA` instead. It will be removed in the next major version.
   */
  ROPSTAN = 0x3,
  /**
   * Sepolia, the testnet for applications and tooling.
   */
  // TODO: check later if Sepolia is still active and supported as the testnet for applications;
  // the Ethereum Foundation planned its end of life on 30 September 2026, with a replacement testnet
  SEPOLIA = 0xaa36a7
}
