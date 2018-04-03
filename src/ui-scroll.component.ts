import {
  Component, OnInit, OnDestroy,
  TemplateRef, ElementRef, Renderer2,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { WorkflowRunner } from './component/runner';
import { Datasource } from './component/interfaces/index';
import { Item } from './component/classes/item';

@Component({
  selector: 'ui-scroll',
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
  public template: TemplateRef<any>;
  public datasource: Datasource;

  // use in the template
  public items: Array<Item>;

  // Component-Workflow integration
  public workflowRunner: WorkflowRunner;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    this.workflowRunner = new WorkflowRunner(this);
  }

  ngOnDestroy() {
    this.workflowRunner.dispose();
  }
}
