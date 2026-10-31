import { TestBed } from '@angular/core/testing';

import { EtherTestModule } from './ether-test.module';
import { EtherTransactionRef } from './ether-transaction-ref.class';
import { EtherTransactionService } from './ether-transaction.service';


describe('EtherTransactionService', () => {
  let service: EtherTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule]
    });
    service = TestBed.inject(EtherTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have prepareTransaction', () => {
    expect(service.prepareTransaction).toBeDefined();
    expect(service.prepareTransaction("0xRANDOM_WALLET_ADDRESS"))
      .toBeInstanceOf(EtherTransactionRef);
  });
});
