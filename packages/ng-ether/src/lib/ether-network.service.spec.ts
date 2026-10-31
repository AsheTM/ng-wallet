import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { EtherNetworkService } from './ether-network.service';
import { EtherTestModule } from './ether-test.module';


describe('EtherNetworkService', () => {
  let service: EtherNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule]
    });
    service = TestBed.inject(EtherNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have blockNumber$', () => {
    expect(service.blockNumber$).toBeDefined();
  });

  it('should have gasFee$', () => {
    expect(service.gasFee$).toBeDefined();
  });

  it('should have network$', () => {
    expect(service.network$).toBeDefined();
  });

  it('should have price$', () => {
    expect(service.price$).toBeDefined();
  });

  it('should have onNetworkChange', () => {
    expect(service.onNetworkChange).toBeDefined();
    expect(service.onNetworkChange()).toBeInstanceOf(Observable);
    expect(service.onNetworkChange((_: any) => null)).toBeUndefined();
  });
});
