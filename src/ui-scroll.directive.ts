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
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    const componentRef = compFactory.create(this.viewContainer.injector);
    componentRef.instance.datasource = this.datasource;
    componentRef.instance.template = this.templateRef;
    componentRef.instance.isTable = this.isTable;
    componentRef.instance.version = version;
    componentRef.instance.parentElement = this.templateRef.elementRef.nativeElement.parentElement;
    this.viewContainer.createEmbeddedView(componentRef.instance.uiScrollTemplateRef);
  }
}
