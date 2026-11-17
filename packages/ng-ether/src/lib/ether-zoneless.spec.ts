import { AsyncPipe } from '@angular/common';
import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { from, Observable } from 'rxjs';

import { ACustomContract } from './contract/ether-contract-custom.class';
import { EtherContractFnAsyncPipe } from './contract/ether-contract-fn-async.pipe';
import { AEtherContract } from './contract/ether-contract.class';
import { ContractInjectable } from './contract/ether-contract.decorator';
import { EtherTestingWallet, provideEtherTesting } from './testing/ether-testing';
import { EtherWalletService } from './wallet/ether-wallet.service';

const firstAccount = '0x0000000000000000000000000000000000000001';
const secondAccount = '0x0000000000000000000000000000000000000002';

@ContractInjectable()
class CustomContract extends ACustomContract {
  decimals(): Observable<number> {
    return from(this.contract['decimals']() as Promise<number>);
  }
}

@Component({
  imports: [AsyncPipe, EtherContractFnAsyncPipe],
  template: `
    <p id="account">{{ account$ | async }}</p>
    <p id="decimals">{{ customContract | etherContractFnAsync: 'decimals' }}</p>
  `,
})
class HostComponent {
  readonly account$: Observable<string> = inject(EtherWalletService).account$;
  readonly customContract: CustomContract = inject(CustomContract);
}

describe('ng-ether without zone.js (zoneless change detection)', () => {
  let wallet: EtherTestingWallet;
  let fixture: ComponentFixture<HostComponent>;
  // Waits until the wallet has answered every request (ethers sends them after a short delay),
  // then for the rendering, instead of a fixed delay that may be too short under load
  const settle = async (): Promise<void> => {
    await wallet.flush();
    await fixture.whenStable();
  };
  const text = (id: string): string =>
    fixture.nativeElement.querySelector(`#${id}`).textContent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideEtherTesting({ accounts: [firstAccount] }),
        { provide: AEtherContract, useValue: { decimals: () => Promise.resolve(18) } },
      ],
    });
    wallet = TestBed.inject(EtherTestingWallet);
    fixture = TestBed.createComponent(HostComponent);
    // No detectChanges(): with zoneless change detection, the view only updates when Angular is notified
    await settle();
  });

  it('displays the account and the contract value', () => {
    expect(text('account')).toBe(firstAccount);
    expect(text('decimals')).toBe('18');
  });

  it('updates the view when the wallet changes account', async () => {
    wallet.setAccounts([secondAccount]);
    await settle();

    expect(text('account')).toBe(secondAccount);
  });
});
