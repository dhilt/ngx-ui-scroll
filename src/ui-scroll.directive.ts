import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, OnInit } from '@angular/core';

import { UiScrollComponent } from './ui-scroll.component';
import { Datasource } from './component/interfaces/datasource';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective implements OnInit {
  private datasource: Datasource;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) {}

  @Input() set uiScrollOf(datasource: Datasource) {
    this.datasource = datasource;
  }

  ngOnInit() {
    const templateView = this.templateRef.createEmbeddedView({});
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    const componentRef = this.viewContainer.createComponent(compFactory, null, this.viewContainer.injector, [templateView.rootNodes]);
    componentRef.instance.datasource = this.datasource;
    componentRef.instance.template = this.templateRef;
  }
}
