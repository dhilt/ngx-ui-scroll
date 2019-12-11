import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, OnInit } from '@angular/core';

import version from './ui-scroll.version';
import { UiScrollComponent } from './ui-scroll.component';
import { Datasource } from './component/interfaces/datasource';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective implements OnInit {
  private version: string;
  private datasource: Datasource;
  private isTable: boolean;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) {
  }

  @Input() set uiScrollOf(datasource: Datasource) {
    this.datasource = datasource;
  }

  @Input() set uiScrollTable(value: any) {
    this.isTable = !!value;
  }

  ngOnInit() {
    const templateView = this.templateRef.createEmbeddedView({});
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    const componentRef = this.viewContainer.createComponent(
      compFactory, undefined, this.viewContainer.injector, [templateView.rootNodes]
    );
    componentRef.instance.datasource = this.datasource;
    componentRef.instance.template = this.templateRef;
    componentRef.instance.isTable = this.isTable;
    componentRef.instance.version = version;
  }
}
