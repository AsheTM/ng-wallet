import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

import { EtherConditionalView } from '../core/ether-conditional-view';
import { injectWalletInfo, TEtherWalletInfo } from './ether-wallet-info';

export type TEtherWalletContext = {
  $implicit: TEtherWalletInfo;
  etherWallet: TEtherWalletInfo;
};

// <div *etherWallet="let wallet; else noWallet">{{ wallet.name }}</div>
@Directive({ selector: '[etherWallet]' })
export class EtherWalletDirective {
  readonly etherWalletElse = input<TemplateRef<unknown> | null>(null);

  private readonly _view = new EtherConditionalView<TEtherWalletContext>(
    inject(ViewContainerRef),
    inject(TemplateRef)
  );
  private readonly _wallet = injectWalletInfo();

  constructor() {
    effect(() => {
      const wallet: TEtherWalletInfo | null = this._wallet();

      this._view.update(
        !!wallet,
        { $implicit: wallet as TEtherWalletInfo, etherWallet: wallet as TEtherWalletInfo },
        this.etherWalletElse()
      );
    });
  }

  // Types the template context; Angular requires both parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static ngTemplateContextGuard(_directive: EtherWalletDirective, context: unknown): context is TEtherWalletContext {
    return true;
  }
}
