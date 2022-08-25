import { TestBed } from '@angular/core/testing';

import { EtherWalletService } from './ether-wallet.service';
import { EtherModule } from './ether.module';

describe('EtherWalletService', () => {
  let service: EtherWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherModule.forRoot()]
    });
    service = TestBed.inject(EtherWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
