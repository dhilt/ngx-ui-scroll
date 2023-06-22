import {
  Component,
  TemplateRef,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { Item } from './vscroll';

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
export class UiScrollComponent<Data = unknown> {
  template: TemplateRef<unknown>;
  items: Item<Data>[] = [];

  detectChanges() {
    this.changeDetector.detectChanges();
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    public elementRef: ElementRef
  ) {}
}
