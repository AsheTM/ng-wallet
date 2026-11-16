import { BlockTag, Contract, ContractEventName, ContractEventPayload, EventLog, Log, Result } from 'ethers';
import { defer, from, map, Observable, Subscriber, throwError } from 'rxjs';

import {
  listenInEtherInjectionContext,
  runInEtherInjectionContext,
  TEtherInjectOptions,
} from '../core/ether-injection';
import { EtherWalletNotInstalledError } from '../wallet/ether-wallet-not-installed.error';

export type TEtherContractEvent<A extends Result = Result> = {
  name: string;
  // Decoded arguments, by index and by name: event.args[0] or event.args['from']
  args: A;
  blockNumber: number;
  transactionHash: string;
  log: EventLog;
};

export type TEtherContractEventFilter = {
  // Values of the indexed arguments, null to match any value: [from, null] for the Transfer events from an address
  args?: unknown[];
};

export type TEtherContractEventQuery = TEtherContractEventFilter & {
  // Block number, negative to count back from the latest block (-1000), or a tag ('latest'); 0 by default
  fromBlock?: BlockTag;
  toBlock?: BlockTag;
};

function toContractEvent(log: EventLog): TEtherContractEvent {
  return {
    name: log.eventName,
    args: log.args,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    log,
  };
}

// The event name, or a filter on its indexed arguments
function toEventFilter(contract: Contract, eventName: string, args: unknown[]): ContractEventName {
  return args.length ? contract.filters[eventName](...args) : eventName;
}

// Without wallet, the contract has no provider to listen to or query the events
function requireProvider<T>(contract: Contract, source: () => Observable<T>): Observable<T> {
  return defer(() =>
    contract.runner?.provider ? source() : throwError(() => new EtherWalletNotInstalledError())
  );
}

// New events of the contract, until unsubscribed: the listener is then removed
export function fromContractEvent(
  contract: Contract,
  eventName: string,
  filter?: TEtherContractEventFilter
): Observable<TEtherContractEvent> {
  return requireProvider(contract, () =>
    new Observable<TEtherContractEvent>((subscriber: Subscriber<TEtherContractEvent>) => {
      const event: ContractEventName = toEventFilter(contract, eventName, filter?.args ?? []);
      // ethers calls the listener with the arguments of the event, then its payload
      const listener = (...args: unknown[]) => {
        subscriber.next(toContractEvent((args.at(-1) as ContractEventPayload).log));
      };

      contract.on(event, listener).catch((error: unknown) => subscriber.error(error));

      return () => {
        void contract.off(event, listener);
      };
    })
  );
}

// Past events of the contract, between two blocks
export function queryContractEvents(
  contract: Contract,
  eventName: string,
  query?: TEtherContractEventQuery
): Observable<TEtherContractEvent[]> {
  return requireProvider(contract, () =>
    from(
      contract.queryFilter(
        toEventFilter(contract, eventName, query?.args ?? []),
        query?.fromBlock,
        query?.toBlock
      )
    ).pipe(
      // A log is only an EventLog when it can be decoded with the ABI
      map((logs: (EventLog | Log)[]) =>
        logs.filter((log: EventLog | Log): log is EventLog => 'args' in log).map(toContractEvent)
      )
    )
  );
}

// Calls fn on each new event, until the injection context is destroyed; returns a function to stop earlier.
// Without wallet, fn is never called
export function onContractEvent(
  contract: Contract,
  eventName: string,
  fn: (event: TEtherContractEvent) => void,
  options?: TEtherInjectOptions & TEtherContractEventFilter
): () => void {
  return runInEtherInjectionContext(onContractEvent, options, () =>
    listenInEtherInjectionContext(fromContractEvent(contract, eventName, { args: options?.args }), fn)
  );
}
