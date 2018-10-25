import {
  Component, OnInit, OnDestroy, AfterViewInit, NgModule,
  TemplateRef, ElementRef, ViewContainerRef, NgModuleRef,
  ChangeDetectionStrategy, ChangeDetectorRef, Compiler, ViewChild, Injector
} from '@angular/core';

import { Workflow } from './component/workflow';
import { Datasource as IDatasource } from './component/interfaces/index';
import { Datasource } from './component/classes/datasource';
import { Item } from './component/classes/item';
import { CommonModule } from '@angular/common';

const template = `<div data-padding-backward></div><div
  *ngFor="let item of context.items"
  [attr.data-sid]="item.nodeId"
  [style.position]="item.invisible ? 'fixed' : null"
  [style.left]="item.invisible ? '-99999px' : null"
><ng-template
  [ngTemplateOutlet]="context.template"
  [ngTemplateOutletContext]="{
    $implicit: item.data,
    index: item.$index
 }"
></ng-template></div><div data-padding-forward></div>`;

@Component({
  selector: '[ui-scroll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #_container></ng-container>
  `
})
export class UiScrollComponent implements OnInit, OnDestroy, AfterViewInit {

  public tagName: string;
  @ViewChild('_container', { read: ViewContainerRef }) _container: ViewContainerRef;

  // come from the directive
  public version: string;
  public template: TemplateRef<any>;
  public datasource: IDatasource | Datasource;

  // use in the template
  public items: Array<Item>;

  // Component-Workflow integration
  public workflow: Workflow;

  constructor(
    private _injector: Injector,
    private _m: NgModuleRef<any>,
    public compiler: Compiler,
    public changeDetector: ChangeDetectorRef,
    public elementRef: ElementRef
  ) {
    this.tagName = 'p';
  }

  ngAfterViewInit() {
    const tmpCmp = Component({ template })(class {
    });
    const tmpModule = NgModule({ imports: [CommonModule], declarations: [tmpCmp] })(class {
    });

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        const cmpRef = f.create(this._injector, [], null, this._m);
        cmpRef.instance.context = this;
        this._container.insert(cmpRef.hostView);

        this.workflow = new Workflow(this);
      });
  }

  ngOnInit() {
    // this.workflow = new Workflow(this);
  }

  ngOnDestroy() {
    this.workflow.dispose();
  }
}
