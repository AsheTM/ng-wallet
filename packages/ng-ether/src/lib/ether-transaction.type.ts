import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { Deferrable } from 'ethers/lib/utils';


export type TEtherTransactionRequest = Deferrable<
  Pick<TransactionRequest, 'chainId' | 'from' | 'to' | 'value'>
    & Partial<Record<'value', string>>
>;

export type TEtherTransactionResponse = TransactionResponse;
