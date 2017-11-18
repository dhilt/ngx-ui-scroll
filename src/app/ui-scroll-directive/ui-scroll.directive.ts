import {Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, OnInit} from '@angular/core';

import { UiScrollService } from './ui-scroll.service';
import { UiScrollComponent } from './ui-scroll.component';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective {
  private param;

  constructor(
      private uiScrollService: UiScrollService, 
      private templateRef: TemplateRef<any>,
      private viewContainer: ViewContainerRef,
      private resolver: ComponentFactoryResolver) {
  }

  @Input() set uiScrollOf(data) {
    this.param = data;
    this.uiScrollService.setDatasource(data);
    //this.viewContainer.createEmbeddedView(this.templateRef);
  }

  ngOnInit() {
    const templateView = this.templateRef.createEmbeddedView({});
    const compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
    this.viewContainer.createComponent(compFactory, null, this.viewContainer.injector, [templateView.rootNodes])
  }
}