import {
  Component, OnInit, OnDestroy,
  TemplateRef, ElementRef, Renderer2,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { WorkflowRunner } from './component/runner';
import { Datasource, Item } from './component/interfaces/index';

@Component({
  selector: 'ui-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div data-padding-backward></div>
<div *ngFor="let item of items" id="{{item.nodeId}}">
  <div [style.position]="item.invisible ? 'fixed' : null" [style.left]="item.invisible ? '-99999px' : null" >
    <ng-template
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="{
        $implicit: item.data,
        index: item.$index
     }">
    </ng-template>
  </div>
</div>
<div data-padding-forward></div>
`
})
export class UiScrollComponent implements OnInit, OnDestroy {

  // come from the directive
  public template: TemplateRef<any>;
  public datasource: Datasource;

  // use in the template
  public items: Array<Item>;

  // Component-Workflow integration
  private workflowRunner: WorkflowRunner;

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
