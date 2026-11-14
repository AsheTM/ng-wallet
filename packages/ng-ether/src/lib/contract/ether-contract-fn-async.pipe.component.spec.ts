import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { from, Observable } from 'rxjs';

import { ACustomContract } from './ether-contract-custom.class';
import { EtherContractFnAsyncPipe } from './ether-contract-fn-async.pipe';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';
import { AEtherContract } from './ether-contract.class';
import { ContractInjectable } from './ether-contract.decorator';


// Stands for the ethers contract: every call resolves asynchronously, like a real RPC call
const contractFake = {
  decimals: () => Promise.resolve(18),
  balanceOf: (owner: unknown) => Promise.resolve(`balance of ${JSON.stringify(owner)}`)
};

@ContractInjectable()
class CustomContract extends ACustomContract {

  // README style: prototype method using this.contract
  decimals(): Observable<number> {
    return from(this.contract['decimals']() as Promise<number>);
  }

  // The pipe arguments arrive as one array
  balanceOf(args: any[]): Observable<string> {
    return from(this.contract['balanceOf'](...args) as Promise<string>);
  }

}

@Component({
  imports: [EtherContractFnAsyncPipe],
  template: ''
})
class HostComponent {
  readonly customContract: CustomContract = inject(CustomContract);
  owner = '';
}

describe('EtherContractFnAsyncPipe in a component', () => {
  afterEach(() => jest.restoreAllMocks());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AEtherContract, useValue: contractFake }]
    });
  });

  // Each case gets its own template, so a throwing case does not break the others
  const render = async (template: string): Promise<ComponentFixture<HostComponent>> => {
    TestBed.overrideComponent(HostComponent, { set: { template } });
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  };

  it('keeps this of a prototype method (README example)', async () => {
    const decimals = jest.spyOn(contractFake, 'decimals');

    await render(`{{ customContract | etherContractFnAsync: 'decimals' }}`);

    expect(decimals).toHaveBeenCalled();
  });

  it('displays the value once the call resolves', async () => {
    const fixture = await render(`{{ customContract | etherContractFnAsync: 'decimals' }}`);

    expect(fixture.nativeElement.textContent.trim()).toBe('18');
  });

  it('calls the method once while its arguments do not change', async () => {
    const balanceOf = jest.spyOn(contractFake, 'balanceOf');
    const fixture = await render(`{{ customContract | etherContractFnAsync: 'balanceOf' : '0xOwner' }}`);

    fixture.detectChanges();
    fixture.detectChanges();

    expect(balanceOf).toHaveBeenCalledTimes(1);
  });

  it('calls the method again when an argument changes', async () => {
    const balanceOf = jest.spyOn(contractFake, 'balanceOf');

    TestBed.overrideComponent(HostComponent, {
      set: { template: `{{ customContract | etherContractFnAsync: 'balanceOf' : owner }}` }
    });
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

    fixture.componentInstance.owner = '0xFirst';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.owner = '0xSecond';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(balanceOf.mock.calls).toEqual([['0xFirst'], ['0xSecond']]);
    expect(fixture.nativeElement.textContent.trim()).toBe('balance of "0xSecond"');
  });

  it('displays nothing, without throwing, when no wallet is installed', async () => {
    jest.spyOn(contractFake, 'decimals').mockRejectedValue(new EtherWalletNotInstalledError());

    const fixture = await render(`{{ customContract | etherContractFnAsync: 'decimals' }}`);

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('passes the pipe arguments as one array', async () => {
    const balanceOf = jest.spyOn(contractFake, 'balanceOf');

    await render(`{{ customContract | etherContractFnAsync: 'balanceOf' : '0xOwner' : 2 }}`);

    expect(balanceOf).toHaveBeenCalledWith('0xOwner', 2);
  });
});
