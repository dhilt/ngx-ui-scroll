import {
  Component, OnInit, OnDestroy,
  TemplateRef, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Workflow } from './component/workflow';
import { Datasource as IDatasource } from './component/interfaces/index';
import { Datasource } from './component/classes/datasource';
import { Item } from './component/classes/item';

const template = `<ng-container *ngIf="isTable"><tr data-sid="backward">
  <td><div data-padding-backward></div></td>
</tr><ng-template
  *ngFor="let item of items"
  [ngTemplateOutlet]="template"
  [ngTemplateOutletContext]="{
    $implicit: item.data,
    index: item.$index,
    odd: item.$index % 2,
    even: !(item.$index % 2)
 }"
></ng-template><tr data-sid="forward">
  <td><div data-padding-forward></div></td>
</tr></ng-container><ng-container *ngIf="!isTable"><div data-padding-backward></div><div
  *ngFor="let item of items"
  [attr.data-sid]="item.nodeId"
  [style.position]="item.invisible ? 'fixed' : null"
  [style.left]="item.invisible ? '-99999px' : null"
><ng-template
  [ngTemplateOutlet]="template"
  [ngTemplateOutletContext]="{
    $implicit: item.data,
    index: item.$index,
    odd: item.$index % 2,
    even: !(item.$index % 2)
 }"
></ng-template></div><div data-padding-forward></div></ng-container>`

/* tslint:disable:component-selector */
@Component({
  selector: 'tbody [ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template
})
export class UiScrollComponent implements OnInit, OnDestroy {

  // come from the directive
  public version: string;
  public template: TemplateRef<any>;
  public datasource: IDatasource | Datasource;
  public isTable: boolean;

  // use in the template
  public items: Array<Item>;

  // Component-Workflow integration
  public workflow: Workflow;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    this.workflow = new Workflow(this);
  }

  ngOnDestroy() {
    this.workflow.dispose();
  }
}
