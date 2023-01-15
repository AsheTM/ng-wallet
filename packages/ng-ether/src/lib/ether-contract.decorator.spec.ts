import { TestBed } from '@angular/core/testing';

import { ContractServiceMock } from './ether-contract.service.mock';
import { EtherTestModule } from './ether-test.module';


describe('ContractServiceMock', () => {
  let smartContract: ContractServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule]
    });
    smartContract = TestBed.inject(ContractServiceMock);
  });

  it('should be created', () => {
    expect(smartContract).toBeTruthy();
  });

  it('shoud have name method implemented', () => {
    expect(smartContract.name).toBeDefined();
  });
});
