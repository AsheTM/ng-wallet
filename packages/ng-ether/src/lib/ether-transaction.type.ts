import { TransactionRequest, TransactionResponse } from 'ethers';


export type TEtherTransactionRequest = Pick<TransactionRequest, 'chainId' | 'from' | 'to' | 'value'>;

export type TEtherTransactionResponse = TransactionResponse;
