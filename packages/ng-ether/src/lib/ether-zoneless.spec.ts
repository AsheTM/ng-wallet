import { AsyncPipe } from '@angular/common';
import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { from, Observable } from 'rxjs';

import { ACustomContract } from './contract/ether-contract-custom.class';
import { EtherContractFnAsyncPipe } from './contract/ether-contract-fn-async.pipe';
import { AEtherContract } from './contract/ether-contract.class';
import { ContractInjectable } from './contract/ether-contract.decorator';
import { ETHER_TOKEN } from './core/ether.token';
import { provideEther } from './ether.providers';
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
  let emitAccountsChanged: (accounts: string[]) => void;
  let fixture: ComponentFixture<HostComponent>;
  // Lets the wallet requests resolve (ethers sends them after a short delay), then waits for the rendering
  const settle = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
  };
  const text = (id: string): string =>
    fixture.nativeElement.querySelector(`#${id}`).textContent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideEther(),
        { provide: AEtherContract, useValue: { decimals: () => Promise.resolve(18) } },
        {
          provide: ETHER_TOKEN,
          useValue: {
            on: (event: string, listener: (accounts: string[]) => void) => {
              if (event === 'accountsChanged') {
                emitAccountsChanged = listener;
              }
            },
            removeListener: () => void 0,
            request: ({ method }: { method: string }) =>
              Promise.resolve(method === 'eth_accounts' ? [firstAccount] : '0x1'),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    // No detectChanges(): with zoneless change detection, the view only updates when Angular is notified
    await settle();
  });

  it('displays the account and the contract value', () => {
    expect(text('account')).toBe(firstAccount);
    expect(text('decimals')).toBe('18');
  });

  it('updates the view when the wallet changes account', async () => {
    emitAccountsChanged([secondAccount]);
    await settle();

    expect(text('account')).toBe(secondAccount);
  });
});
