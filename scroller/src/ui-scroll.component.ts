import {
  Component,
  TemplateRef,
  ElementRef,
  ChangeDetectionStrategy,
  NgZone,
  inject,
  DestroyRef,
  signal,
  afterNextRender
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { IDatasource, Workflow, Item } from './vscroll';
import { IDatasource as IAngularDatasource, RoutinesClassType } from './types';
import consumer from './ui-scroll.version';

@Component({
  selector: '[ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-scroll.component.html',
  imports: [NgTemplateOutlet],
  standalone: true
})
export class UiScrollComponent<Data = unknown> {
  // template, datasource and Routines come from the directive
  // `template` is a signal to trigger view updates whenever changes.
  readonly template = signal<TemplateRef<unknown> | null>(null);
  public datasource!: IAngularDatasource<Data>;
  public Routines?: RoutinesClassType;

  // the only template variable
  readonly items = signal<Item<Data>[]>([]);

  // Component-Workflow integration
  public workflow!: Workflow<Data>;

  private ngZone = inject(NgZone);
  private element = inject(ElementRef).nativeElement;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.workflow?.dispose());

    afterNextRender(() => {
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
            element: this.element,
            datasource: this.datasource as unknown as IDatasource<Data>,
            run: (items: Item<Data>[]) => {
              if (!items.length && !this.items.length) {
                return;
              }
              // Updating a signal would schedule a change detection in both zoneless and zone.js modes.
              this.ngZone.run(() => this.items.set(items));
            },
            ...(this.Routines ? { Routines: this.Routines } : {})
          })
      );
    });
  }
}
