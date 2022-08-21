import { TestBed } from '@angular/core/testing';

import { EtherTransactionService } from './ether-transaction.service';

describe('EtherTransactionService', () => {
  let service: EtherTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtherTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
