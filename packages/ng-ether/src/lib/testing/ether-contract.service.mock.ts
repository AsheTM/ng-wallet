import { from, Observable } from 'rxjs';

import { ACustomContract } from '../contract/ether-contract-custom.class';
import { ContractInjectable } from '../contract/ether-contract.decorator';


@ContractInjectable()
export class ContractServiceMock extends ACustomContract {

  name(): Observable<string> {
    return from(this.contract['name']() as Promise<string>);
  }

}
