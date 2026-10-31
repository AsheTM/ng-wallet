import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ChangeDetectorRefMock } from './ether-contract-fn-async.mock';
import { EtherContractFnAsyncPipe } from './ether-contract-fn-async.pipe';
import { ContractServiceMock } from './ether-contract.service.mock';
import { EtherTestModule } from './ether-test.module';


describe('EtherContractFnAsyncPipe', () => {
  let pipe: EtherContractFnAsyncPipe;
  let service: ContractServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        EtherTestModule
      ],
      providers: [{
        provide: ChangeDetectorRef,
        useClass: ChangeDetectorRefMock
      }]
    });
    const changeDetectionRef: ChangeDetectorRef = TestBed.inject(ChangeDetectorRef);

    pipe = new EtherContractFnAsyncPipe(changeDetectionRef);
    service = TestBed.inject(ContractServiceMock);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should do the transform work properly', () => {
    const name = 'name' as const;

    jest.spyOn(service, 'name').mockReturnValue(of(name));

    const result: 'name' = pipe.transform(service.name);

    expect(result).toEqual(name);
  })
});
