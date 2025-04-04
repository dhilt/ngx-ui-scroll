import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit
} from '@angular/core';

import { UiScrollComponent } from './ui-scroll.component';
import { IDatasource, RoutinesClassType } from './types';

@Directive({ selector: '[uiScroll][uiScrollOf]' })
export class UiScrollDirective<ItemData = unknown> implements OnInit {
  private datasource!: IDatasource<ItemData>;
  private Routines?: RoutinesClassType;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set uiScrollOf(datasource: IDatasource<ItemData>) {
    this.datasource = datasource;
  }

  @Input() set uiScrollRoutines(Routines: RoutinesClassType) {
    this.Routines = Routines;
  }

  ngOnInit(): void {
    const componentRef = this.viewContainer.createComponent(UiScrollComponent);
    componentRef.instance.datasource = this.datasource as IDatasource;
    componentRef.instance.template.set(this.templateRef);
    componentRef.instance.Routines = this.Routines;
  }
}
