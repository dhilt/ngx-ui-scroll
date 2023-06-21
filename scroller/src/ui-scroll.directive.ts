import {
  ComponentRef,
  Directive,
  Inject,
  Input,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { UiScrollComponent } from './ui-scroll.component';
import { IDatasource } from './ui-scroll.datasource';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective<ItemData = unknown> {
  @Input()
  set uiScrollOf(datasource: IDatasource<ItemData>) {
    this._componentRef?.instance.createWorkflow(datasource as IDatasource);
  }

  private _componentRef: ComponentRef<UiScrollComponent> | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: string,
    templateRef: TemplateRef<unknown>,
    viewContainer: ViewContainerRef
  ) {
    // Note: we create the component in the directive constructor to support zoneless mode
    // (when the zone.js isn't bundled and nooped through bootstrap options).
    // Because `ngOnInit` may not be run until the change detection is called again explicitly.
    // The directive constructor is called when Angular creates a component and calls `createDirectivesInstances`,
    // compared to `ngOnInit`, which is called only during change detection cycles, when Angular calls
    // `refreshView` and `executeInitAndCheckHooks`.
    if (isPlatformBrowser(platformId)) {
      this._componentRef = viewContainer.createComponent(UiScrollComponent);
      this._componentRef.instance.template = templateRef;
      this._componentRef.changeDetectorRef.detectChanges();
    }
  }
}
