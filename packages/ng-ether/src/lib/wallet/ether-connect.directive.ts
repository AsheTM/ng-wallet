import { DestroyRef, Directive, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, take } from 'rxjs';

import { EtherWalletService } from './ether-wallet.service';

// <button etherConnect (etherConnectSuccess)="…" (etherConnectError)="…">Connect</button>
// Calls connectWallet() on click; disabled (attribute, so it also works on other elements) and aria-busy
// while the wallet asks the user; nothing is emitted after the element is destroyed
@Directive({
  selector: '[etherConnect]',
  host: {
    '(click)': 'connect()',
    '[attr.disabled]': 'pending() ? "" : null',
    '[attr.aria-busy]': 'pending() ? "true" : null',
  },
})
export class EtherConnectDirective {
  readonly etherConnectSuccess = output<string[]>();
  readonly etherConnectError = output<unknown>();

  private readonly _pending = signal(false);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _walletService: EtherWalletService = inject(EtherWalletService);

  // true while waiting for the wallet
  readonly pending = this._pending.asReadonly();

  connect(): void {
    if (this._pending()) {
      return;
    }

    this._pending.set(true);
    this._walletService
      .connectWallet()
      .pipe(
        take(1),
        finalize(() => this._pending.set(false)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: (accounts: string[]) => this.etherConnectSuccess.emit(accounts),
        error: (error: unknown) => this.etherConnectError.emit(error),
      });
  }
}
