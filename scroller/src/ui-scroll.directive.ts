import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, OnInit } from '@angular/core';

import { UiScrollComponent } from './ui-scroll.component';
import { IDatasource } from './ui-scroll.datasource';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective<ItemData = unknown> implements OnInit {
  private datasource!: IDatasource<ItemData>;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) {
  }

  @Input() set uiScrollOf(datasource: IDatasource<ItemData>) {
    this.datasource = datasource;
  }

  ngOnInit(): void {
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    const componentRef = this.viewContainer.createComponent(
      compFactory, void 0, this.viewContainer.injector
    );
    componentRef.instance.datasource = this.datasource as IDatasource;
    componentRef.instance.template = this.templateRef;
  }
}
