import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

import { UiScrollComponent } from '../component/ui-scroll.component';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective {
  private datasource;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) {}

  @Input() set uiScrollOf(datasource) {
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
