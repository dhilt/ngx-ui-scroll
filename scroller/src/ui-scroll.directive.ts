import {
  ComponentRef,
  Directive,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Workflow, IDatasource, Item } from 'vscroll';

import { UiScrollComponent } from './ui-scroll.component';
import { IDatasource as IAngularDatasource } from './ui-scroll.datasource';
import consumer from './ui-scroll.version';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective<Data = unknown> implements OnDestroy {
  public workflow?: Workflow<Data>;

  private _componentRef?: ComponentRef<UiScrollComponent<Data>>;

  private get component() {
    return this._componentRef?.instance as UiScrollComponent<Data>;
  }

  private dispose(): void {
    this.workflow?.dispose();
    this.workflow = void 0;
  }

  @Input()
  set uiScrollOf(datasource: IAngularDatasource<Data>) {
    this.dispose();

    // The workflow should be created outside of the Angular zone because it's causing many
    // change detection cycles. It runs its `init()` function in a `setTimeout` task, which
    // then sets up the `scroll` listener. The `scroll` event listener would force Angular to
    // run `tick()` any time the `scroll` task is invoked. We don't care about `scroll` events
    // since they're handled internally by `vscroll`. We still run change detection manually
    // tho when the `run` function is invoked.
    // `scroll` events may be also unpatched through zone.js flags:
    // `(window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll']`.
    // Having `runOutsideAngular` guarantees we're responsible for running change detection
    // only when it's "required" (when `items` are updated and the template should be updated too).

    this.workflow = this.ngZone.runOutsideAngular(
      () =>
        new Workflow<Data>({
          consumer,
          element: this.component.elementRef.nativeElement,
          datasource: datasource as unknown as IDatasource<Data>,
          run: (items: Item<Data>[]) => {
            if (!items.length && !this.component.items.length) {
              return;
            }
            // Re-enter the Angular zone only when items are set and when we have to run the local change detection.
            this.ngZone.run(() => {
              this.component.items = items;
              this.component.detectChanges();
            });
          }
        })
    );
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: string,
    templateRef: TemplateRef<unknown>,
    viewContainer: ViewContainerRef,
    private ngZone: NgZone
  ) {
    // Note: we create the component in the directive constructor to support zoneless mode
    // (when the zone.js isn't bundled and nooped through bootstrap options).
    // Because `ngOnInit` may not be run until the change detection is called again explicitly.
    // The directive constructor is called when Angular creates a component and calls `createDirectivesInstances`,
    // compared to `ngOnInit`, which is called only during change detection cycles, when Angular calls
    // `refreshView` and `executeInitAndCheckHooks`.
    if (isPlatformBrowser(platformId)) {
      this._componentRef =
        viewContainer.createComponent<UiScrollComponent<Data>>(
          UiScrollComponent
        );
      this._componentRef.instance.template = templateRef;
    }
  }

  ngOnDestroy(): void {
    this.dispose();
  }
}
