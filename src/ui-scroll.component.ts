import {
  Component, OnInit, OnDestroy,
  TemplateRef, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { IDatasource, Workflow, Item } from './vscroll';

import { IDatasource as IAngularDatasource } from './ui-scroll.datasource';
import consumer from './ui-scroll.version';

@Component({
  selector: '[ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-padding-backward></div>
    <div
      *ngFor="let item of items"
      [attr.data-sid]="item.$index"
      [style.position]="item.invisible ? 'fixed' : null"
      [style.left]="item.invisible ? '-99999px' : null">
      <ng-template
        [ngTemplateOutlet]="template"
        [ngTemplateOutletContext]="{
          $implicit: item.data,
          index: item.$index,
          odd: item.$index % 2,
          even: !(item.$index % 2)
      }"></ng-template>
    </div>
    <div data-padding-forward></div>`
})
export class UiScrollComponent<Data = unknown> implements OnInit, OnDestroy {

  // these should come from the directive
  public template: TemplateRef<unknown>;
  public datasource: IAngularDatasource<Data>;

  // the only template variable
  public items: Item<Data>[] = [];

  // Component-Workflow integration
  public workflow: Workflow<Data>;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public elementRef: ElementRef) { }

  ngOnInit(): void {
    this.workflow = new Workflow<Data>({
      consumer,
      element: this.elementRef.nativeElement,
      datasource: this.datasource as unknown as IDatasource<Data>,
      run: items => {
        if (!items.length && !this.items.length) {
          return;
        }
        this.items = items;
        this.changeDetector.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.workflow.dispose();
  }
}
