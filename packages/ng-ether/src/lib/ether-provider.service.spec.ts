import { TestBed } from '@angular/core/testing';

import { EtherProviderService } from './ether-provider.service';

describe('EtherProviderService', () => {
  let service: EtherProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtherProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
