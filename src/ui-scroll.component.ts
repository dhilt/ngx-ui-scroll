import {
  Component, OnInit, OnDestroy,
  TemplateRef, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild
} from '@angular/core';

import { Workflow } from './component/workflow';
import { Datasource as IDatasource } from './component/interfaces/index';
import { Datasource } from './component/classes/datasource';
import { Item } from './component/classes/item';

const tableTemplate = `
<ng-container *ngIf="isTable">
  <tr data-sid="backward">
    <td><div data-padding-backward></div></td>
  </tr>
  <ng-template
    *ngFor="let item of items"
    [ngTemplateOutlet]="template"
    [ngTemplateOutletContext]="{
      $implicit: item.data,
      index: item.$index,
      odd: item.$index % 2,
      even: !(item.$index % 2)
  }"></ng-template>
  <tr data-sid="forward">
    <td><div data-padding-forward></div></td>
  </tr>
</ng-container>
`;

const commonTemplate = `
<ng-container *ngIf="!isTable">
  <div data-padding-backward></div>
  <div
    *ngFor="let item of items"
    [attr.data-sid]="item.nodeId"
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
  <div data-padding-forward></div>
</ng-container>
`;

/* tslint:disable:component-selector */
@Component({
  selector: 'tbody [ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #uiScrollTemplateRef>
    ${commonTemplate}
    ${tableTemplate}
  </ng-template>`
})
export class UiScrollComponent implements OnInit, OnDestroy {

  @ViewChild('uiScrollTemplateRef', { static: true })
  public uiScrollTemplateRef: TemplateRef<any>;

  // come from the directive
  public version: string;
  public template: TemplateRef<any>;
  public datasource: IDatasource | Datasource;
  public isTable: boolean;
  public parentElement: HTMLElement;

  // use in the template
  public items: Item[] = [];

  // Component-Workflow integration
  public workflow: Workflow;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public elementRef: ElementRef
  ) {
    setTimeout(() => this.ngOnInit()); // 😢
  }

  ngOnInit() {
    this.workflow = new Workflow(
      this.parentElement, // this.elementRef.nativeElement,
      this.datasource,
      this.version,
      (items: Item[]) => {
        if (!items.length && !this.items.length) {
          return;
        }
        this.items = items;
        this.changeDetector.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    this.workflow.dispose();
  }
}
