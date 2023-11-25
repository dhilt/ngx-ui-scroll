import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { IDatasource, Workflow, Item } from './vscroll';

import { IDatasource as IAngularDatasource } from './ui-scroll.datasource';
import consumer from './ui-scroll.version';
import { CustomRoutines } from './types';

@Component({
  selector: '[ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div data-padding-backward></div>
    <div
      *ngFor="let item of items"
      [attr.data-sid]="item.$index"
      [style.position]="item.invisible ? 'fixed' : null"
      [style.left]="item.invisible ? '-99999px' : null"
    >
      <ng-template
        [ngTemplateOutlet]="template"
        [ngTemplateOutletContext]="{
          $implicit: item.data,
          index: item.$index,
          odd: item.$index % 2,
          even: !(item.$index % 2)
        }"
      ></ng-template>
    </div>
    <div data-padding-forward></div>`
})
export class UiScrollComponent<Data = unknown> implements OnInit, OnDestroy {
  // these should come from the directive
  public template!: TemplateRef<unknown>;
  public datasource!: IAngularDatasource<Data>;
  public Routines?: CustomRoutines;

  // the only template variable
  public items: Item<Data>[] = [];

  // Component-Workflow integration
  public workflow!: Workflow<Data>;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
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
          element: this.elementRef.nativeElement,
          datasource: this.datasource as unknown as IDatasource<Data>,
          run: (items: Item<Data>[]) => {
            if (!items.length && !this.items.length) {
              return;
            }
            // Re-enter the Angular zone only when items are set and when we have to run the local change detection.
            this.ngZone.run(() => {
              this.items = items;
              this.changeDetector.detectChanges();
            });
          },
          ...(this.Routines ? { Routines: this.Routines } : {})
        })
    );
  }

  ngOnDestroy(): void {
    this.workflow?.dispose();
  }
}
