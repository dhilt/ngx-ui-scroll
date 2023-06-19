import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { UiScrollComponent } from './ui-scroll.component';
import { IDatasource } from './ui-scroll.datasource';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective<ItemData = unknown> implements OnInit {
  private datasource!: IDatasource<ItemData>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set uiScrollOf(datasource: IDatasource<ItemData>) {
    this.datasource = datasource;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const componentRef =
        this.viewContainer.createComponent(UiScrollComponent);
      componentRef.instance.datasource = this.datasource as IDatasource;
      componentRef.instance.template = this.templateRef;
    }
  }
}
