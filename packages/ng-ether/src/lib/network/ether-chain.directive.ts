import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

import { EtherConditionalView } from '../core/ether-conditional-view';
import { injectChainId } from './ether-network.signal';

export type TEtherChainContext = {
  // Current chain ID
  $implicit: number;
};

// <div *etherChain="11155111; else wrongChain">…</div>, or an array of chain IDs
@Directive({ selector: '[etherChain]' })
export class EtherChainDirective {
  readonly etherChain = input.required<number | readonly number[]>();
  readonly etherChainElse = input<TemplateRef<unknown> | null>(null);

  private readonly _view = new EtherConditionalView<TEtherChainContext>(
    inject(ViewContainerRef),
    inject(TemplateRef)
  );
  private readonly _chainId = injectChainId();

  constructor() {
    effect(() => {
      const chainId: number | undefined = this._chainId();
      const chainIds: readonly number[] = ([] as number[]).concat(this.etherChain());

      this._view.update(
        chainId !== undefined && chainIds.includes(chainId),
        { $implicit: chainId ?? 0 },
        this.etherChainElse()
      );
    });
  }

  // Types the template context; Angular requires both parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static ngTemplateContextGuard(_directive: EtherChainDirective, context: unknown): context is TEtherChainContext {
    return true;
  }
}
