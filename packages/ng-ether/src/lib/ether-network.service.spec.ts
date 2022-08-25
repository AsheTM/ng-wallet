import { TestBed } from '@angular/core/testing';

import { EtherNetworkService } from './ether-network.service';
import { EtherModule } from './ether.module';

fdescribe('EtherNetworkService', () => {
  let service: EtherNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherModule.forRoot()]
    });
    service = TestBed.inject(EtherNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
