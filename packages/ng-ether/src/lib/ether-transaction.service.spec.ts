import { TestBed } from '@angular/core/testing';

import { EtherTransactionService } from './ether-transaction.service';
import { EtherModule } from './ether.module';

describe('EtherTransactionService', () => {
  let service: EtherTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherModule.forRoot()]
    });
    service = TestBed.inject(EtherTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
