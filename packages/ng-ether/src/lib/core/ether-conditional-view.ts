import { EmbeddedViewRef, TemplateRef, ViewContainerRef } from '@angular/core';

// Renders the then template while show is true, the else template (if any) otherwise.
// The view is only created again when show or the else template changes: a new context value
// (for example another account) updates the existing view instead of creating a new one
export class EtherConditionalView<C extends object> {
  private _shown: boolean | null = null;
  private _elseTemplate: TemplateRef<unknown> | null = null;
  private _thenView: EmbeddedViewRef<C> | null = null;

  constructor(
    private readonly _viewContainer: ViewContainerRef,
    private readonly _thenTemplate: TemplateRef<C>
  ) {}

  update(show: boolean, context: C, elseTemplate: TemplateRef<unknown> | null): void {
    if (show === this._shown && (show || elseTemplate === this._elseTemplate)) {
      if (this._thenView) {
        Object.assign(this._thenView.context, context);
        this._thenView.markForCheck();
      }

      return;
    }

    this._viewContainer.clear();
    this._thenView = null;

    if (show) {
      this._thenView = this._viewContainer.createEmbeddedView(this._thenTemplate, { ...context });
    } else if (elseTemplate) {
      this._viewContainer.createEmbeddedView(elseTemplate);
    }

    this._shown = show;
    this._elseTemplate = elseTemplate;
  }
}
