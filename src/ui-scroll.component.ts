import {
  Component, OnInit, OnDestroy,
  TemplateRef, ElementRef, Renderer2,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Workflow } from './component/workflow';
import { Datasource } from './component/interfaces/index';
import { Item } from './component/classes/item';

@Component({
  selector: '[ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div data-padding-backward></div><div
  *ngFor="let item of items"
  [attr.data-sid]="item.nodeId"
  [style.position]="item.invisible ? 'fixed' : null"
  [style.left]="item.invisible ? '-99999px' : null"
><ng-template
  [ngTemplateOutlet]="template"
  [ngTemplateOutletContext]="{
    $implicit: item.data,
    index: item.$index
 }"
></ng-template></div><div data-padding-forward></div>`
})
export class UiScrollComponent implements OnInit, OnDestroy {

  // come from the directive
  public version: string;
  public template: TemplateRef<any>;
  public datasource: Datasource;

  // use in the template
  public items: Array<Item>;

  // Component-Workflow integration
  public workflow: Workflow;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    this.workflow = new Workflow(this);
  }

  ngOnDestroy() {
    this.workflow.dispose();
  }
}
