import { Observable } from "rxjs";


export type TContractFunction = ((...args: any[]) => Observable<any>) | { _$?: null; };
export type TCustomContractFunction = Record<string, (...args: any[]) => Promise<any>>;
