import { Observable } from "rxjs";


export type TContractFunction = ((...args: unknown[]) => Observable<unknown>) | { _$?: null; };
export type TCustomContractFunction = Record<string, (...args: unknown[]) => Promise<unknown>>;
