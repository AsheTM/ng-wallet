import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

import { EtherConditionalView } from '../core/ether-conditional-view';
import { injectAccount } from './ether-wallet.signal';

export type TEtherConnectedContext = {
  $implicit: string;
  etherConnected: string;
};

// <div *etherConnected="let account; else connect">{{ account }}</div>
// Changing account updates the view, it is only created again on connection or disconnection
@Directive({ selector: '[etherConnected]' })
export class EtherConnectedDirective {
  readonly etherConnectedElse = input<TemplateRef<unknown> | null>(null);

  private readonly _view = new EtherConditionalView<TEtherConnectedContext>(
    inject(ViewContainerRef),
    inject(TemplateRef)
  );
  private readonly _account = injectAccount();

  constructor() {
    effect(() => {
      const account: string = this._account() ?? '';

      this._view.update(
        !!account,
        { $implicit: account, etherConnected: account },
        this.etherConnectedElse()
      );
    });
  }

  // Types the template context; Angular requires both parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static ngTemplateContextGuard(_directive: EtherConnectedDirective, context: unknown): context is TEtherConnectedContext {
    return true;
  }
}
