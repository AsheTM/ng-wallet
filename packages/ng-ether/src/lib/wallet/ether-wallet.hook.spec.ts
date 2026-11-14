import { Component, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Network } from 'ethers';
import { Subject } from 'rxjs';

import { onNetworkChange } from '../network/ether-network.hook';
import { EtherNetworkService } from '../network/ether-network.service';
import { TEtherNetworkChange } from '../network/ether-network.type';
import { EtherWalletNotInstalledError } from './ether-wallet-not-installed.error';
import { onAccountChange, onWalletConnect, onWalletDisconnect } from './ether-wallet.hook';
import { EtherWalletService } from './ether-wallet.service';

const account = '0x0000000000000000000000000000000000000001';

const connect = jest.fn<void, [string[]]>();
const disconnect = jest.fn<void, []>();
const accountChange = jest.fn<void, [string[]]>();
const networkChange = jest.fn<void, [TEtherNetworkChange]>();

@Component({ template: '' })
class HostComponent {
  readonly stopAccountChange = onAccountChange(accountChange);

  constructor() {
    onWalletConnect(connect);
    onWalletDisconnect(disconnect);
    onNetworkChange(networkChange);
  }
}

describe('ng-ether hooks', () => {
  let accounts$: Subject<string[]>;
  let networks$: Subject<TEtherNetworkChange>;

  beforeEach(() => {
    jest.clearAllMocks();
    accounts$ = new Subject();
    networks$ = new Subject();
    TestBed.configureTestingModule({
      providers: [
        { provide: EtherWalletService, useValue: { onAccountChange: () => accounts$ } },
        { provide: EtherNetworkService, useValue: { onNetworkChange: () => networks$ } }
      ]
    });
  });

  it('calls the hooks on connection, account and network changes', () => {
    TestBed.createComponent(HostComponent);
    const change: TEtherNetworkChange = { newNetwork: Network.from(1) };

    accounts$.next([]);
    accounts$.next([account]);
    accounts$.next([]);
    networks$.next(change);

    // Disconnected from the start is not a disconnection
    expect(connect.mock.calls).toEqual([[[account]]]);
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(accountChange.mock.calls).toEqual([[[]], [[account]], [[]]]);
    expect(networkChange).toHaveBeenCalledWith(change);
  });

  it('calls onWalletConnect once per connection, not on each account change', () => {
    TestBed.createComponent(HostComponent);

    accounts$.next([account]);
    accounts$.next(['0x0000000000000000000000000000000000000002']);

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('stops when the component is destroyed', () => {
    TestBed.createComponent(HostComponent).destroy();

    accounts$.next([account]);
    networks$.next({ newNetwork: Network.from(1) });

    expect(connect).not.toHaveBeenCalled();
    expect(accountChange).not.toHaveBeenCalled();
    expect(networkChange).not.toHaveBeenCalled();
  });

  it('stops earlier with the returned function', () => {
    TestBed.createComponent(HostComponent).componentInstance.stopAccountChange();

    accounts$.next([account]);

    expect(accountChange).not.toHaveBeenCalled();
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('does not throw without wallet', () => {
    TestBed.createComponent(HostComponent);

    expect(() => accounts$.error(new EtherWalletNotInstalledError())).not.toThrow();
    expect(connect).not.toHaveBeenCalled();
  });

  it('needs an injection context, or an injector', () => {
    expect(() => onAccountChange(accountChange)).toThrow();

    onAccountChange(accountChange, { injector: TestBed.inject(Injector) });
    accounts$.next([account]);

    expect(accountChange).toHaveBeenCalledWith([account]);
  });
});
