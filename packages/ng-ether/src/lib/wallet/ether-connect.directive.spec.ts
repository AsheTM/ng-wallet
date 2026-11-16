import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { EtherConnectDirective } from './ether-connect.directive';
import { EtherWalletService } from './ether-wallet.service';

const account = '0x0000000000000000000000000000000000000001';

@Component({
  imports: [EtherConnectDirective],
  template: `
    @if (show) {
      <button etherConnect (etherConnectSuccess)="accounts = $event" (etherConnectError)="error = $event">
        Connect
      </button>
    }
  `,
})
class HostComponent {
  show = true;
  accounts: string[] | null = null;
  error: unknown = null;
}

describe('etherConnect', () => {
  let connection$: Subject<string[]>;
  let connectWallet: jest.Mock;
  let fixture: ComponentFixture<HostComponent>;
  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    connection$ = new Subject();
    connectWallet = jest.fn(() => connection$);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: EtherWalletService, useValue: { connectWallet } },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('is disabled and busy while waiting for the wallet, then emits the accounts', async () => {
    button().click();
    await fixture.whenStable();

    expect(button().disabled).toBe(true);
    expect(button().getAttribute('aria-busy')).toBe('true');

    connection$.next([account]);
    await fixture.whenStable();

    expect(fixture.componentInstance.accounts).toEqual([account]);
    expect(button().disabled).toBe(false);
    expect(button().hasAttribute('aria-busy')).toBe(false);
  });

  it('emits the error, for example when the user rejects the connection', async () => {
    const error = new Error('user rejected action');

    button().click();
    connection$.error(error);
    await fixture.whenStable();

    expect(fixture.componentInstance.error).toBe(error);
    expect(button().disabled).toBe(false);
  });

  it('asks the wallet once, even when clicked again while waiting', () => {
    button().click();
    button().click();

    expect(connectWallet).toHaveBeenCalledTimes(1);
  });

  it('emits nothing after the button is destroyed', async () => {
    button().click();
    fixture.componentInstance.show = false;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(connection$.observed).toBe(false);
    expect(fixture.componentInstance.accounts).toBeNull();
  });
});
