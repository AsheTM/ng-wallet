import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Network } from 'ethers';
import { Subject } from 'rxjs';

import { ETHER_TOKEN, ETHER_TOKEN_IS_WALLET_INSTALLED } from './core/ether.token';
import { EtherChainDirective } from './network/ether-chain.directive';
import { EtherNetworkService } from './network/ether-network.service';
import { TEtherNetwork } from './network/ether-network.type';
import { EtherConnectedDirective } from './wallet/ether-connected.directive';
import { getEtherWalletInfo, injectWalletInstalled } from './wallet/ether-wallet-info';
import { EtherWalletDirective } from './wallet/ether-wallet.directive';
import { EtherWalletService } from './wallet/ether-wallet.service';

const firstAccount = '0x0000000000000000000000000000000000000001';
const secondAccount = '0x0000000000000000000000000000000000000002';

@Component({
  imports: [EtherChainDirective, EtherConnectedDirective, EtherWalletDirective],
  template: `
    <p id="wallet" *etherWallet="let wallet; else noWallet">{{ wallet.name }}</p>
    <ng-template #noWallet><p id="wallet">No wallet</p></ng-template>

    <p id="account" *etherConnected="let account; else disconnected">{{ account }}</p>
    <ng-template #disconnected><p id="account">Disconnected</p></ng-template>

    <p id="chain" *etherChain="[1, 11155111]; else wrongChain">On chain</p>
    <ng-template #wrongChain><p id="chain">Wrong chain</p></ng-template>
  `,
})
class HostComponent {}

describe('ng-ether structural directives', () => {
  let account$: Subject<string | undefined>;
  let network$: Subject<TEtherNetwork>;
  let fixture: ComponentFixture<HostComponent>;
  const text = (id: string): string | undefined =>
    fixture.nativeElement.querySelector(`#${id}`)?.textContent;
  const setUp = async (ethereum: Record<string, unknown> | undefined): Promise<void> => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ETHER_TOKEN, useValue: ethereum },
        { provide: ETHER_TOKEN_IS_WALLET_INSTALLED, useValue: !!ethereum },
        { provide: EtherWalletService, useValue: { account$ } },
        { provide: EtherNetworkService, useValue: { network$ } },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  };

  beforeEach(() => {
    account$ = new Subject();
    network$ = new Subject();
  });

  it('shows the else templates without wallet', async () => {
    await setUp(undefined);

    expect(text('wallet')).toBe('No wallet');
    expect(text('account')).toBe('Disconnected');
    expect(text('chain')).toBe('Wrong chain');
  });

  it('shows the wallet, the account and the chain', async () => {
    await setUp({ isMetaMask: true });
    account$.next(firstAccount);
    network$.next(Network.from(11155111));
    await fixture.whenStable();

    expect(text('wallet')).toBe('MetaMask');
    expect(text('account')).toBe(firstAccount);
    expect(text('chain')).toBe('On chain');
  });

  it('updates the account without creating the view again', async () => {
    await setUp({ isMetaMask: true });
    account$.next(firstAccount);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement.querySelector('#account');

    account$.next(secondAccount);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#account')).toBe(element);
    expect(text('account')).toBe(secondAccount);
  });

  it('switches to the else templates on disconnection and on another chain', async () => {
    await setUp({ isMetaMask: true });
    account$.next(firstAccount);
    network$.next(Network.from(1));
    await fixture.whenStable();

    account$.next(undefined);
    network$.next(Network.from(137));
    await fixture.whenStable();

    expect(text('account')).toBe('Disconnected');
    expect(text('chain')).toBe('Wrong chain');
  });
});

describe('ng-ether wallet info', () => {
  it('names the wallet from its flags, its own flag before isMetaMask', () => {
    expect(getEtherWalletInfo({ isMetaMask: true })).toEqual({ name: 'MetaMask', isMetaMask: true });
    expect(getEtherWalletInfo({ isMetaMask: true, isRabby: true })).toEqual({ name: 'Rabby', isMetaMask: false });
    expect(getEtherWalletInfo({}).name).toBe('Unknown wallet');
  });

  it('tells if a wallet is installed', () => {
    TestBed.configureTestingModule({ providers: [{ provide: ETHER_TOKEN_IS_WALLET_INSTALLED, useValue: true }] });

    expect(TestBed.runInInjectionContext(() => injectWalletInstalled())()).toBe(true);
  });
});
