import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { EtherTestModule } from './ether-test.module';
import { EtherWalletService } from './ether-wallet.service';

describe('EtherWalletService', () => {
  let service: EtherWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EtherTestModule]
    });
    service = TestBed.inject(EtherWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have account$', () => {
    expect(service.account$).toBeDefined();
  });

  it('should have balance$', () => {
    expect(service.balance$).toBeDefined();
  });

  it('should have transactionCount$', () => {
    expect(service.transactionCount$).toBeDefined();
  });

  it('should have connectWallet', () => {
    expect(service.connectWallet).toBeDefined();
  });

  it('should have getBalanceOf', () => {
    expect(service.getBalanceOf).toBeDefined();
  });

  it('should have onAccountChange', () => {
    expect(service.onAccountChange).toBeDefined();
    expect(service.onAccountChange()).toBeInstanceOf(Observable);
    expect(service.onAccountChange((_: any) => null)).toBeUndefined();
  });

  it('should have onConnect', () => {
    expect(service.onConnect).toBeDefined();
    expect(service.onConnect()).toBeInstanceOf(Observable);
    expect(service.onConnect((_: any) => null)).toBeUndefined();
  });

  it('should have onDisconnect', () => {
    expect(service.onDisconnect).toBeDefined();
    expect(service.onDisconnect()).toBeInstanceOf(Observable);
    expect(service.onDisconnect(() => null)).toBeUndefined();
  });
});
