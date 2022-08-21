import { TestBed } from '@angular/core/testing';

import { EtherNetworkService } from './ether-network.service';

describe('EtherNetworkService', () => {
  let service: EtherNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtherNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
