import {Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, OnInit} from '@angular/core';

import { UiScrollComponent } from './ui-scroll.component';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective {
  private param;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) {}

  @Input() set uiScrollOf(data) {
    this.param = data;
  }

  ngOnInit() {
    const templateView = this.templateRef.createEmbeddedView({});
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    const componentRef = this.viewContainer.createComponent(compFactory, null, this.viewContainer.injector, [templateView.rootNodes]);
    componentRef.instance.datasource = this.param;
    componentRef.instance.templateVariable = this.templateRef;
  }
}
