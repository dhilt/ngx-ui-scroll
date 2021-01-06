import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, OnInit } from '@angular/core';

import version from './ui-scroll.version';
import { UiScrollComponent } from './ui-scroll.component';
import { IDatasource } from 'vscroll';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective implements OnInit {
  private datasource: IDatasource;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) {
  }

  @Input() set uiScrollOf(datasource: IDatasource) {
    this.datasource = datasource;
  }

  ngOnInit() {
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    const componentRef = this.viewContainer.createComponent(
      compFactory, void 0, this.viewContainer.injector
    );
    componentRef.instance.datasource = this.datasource;
    componentRef.instance.template = this.templateRef;
    componentRef.instance.version = version;
  }
}
