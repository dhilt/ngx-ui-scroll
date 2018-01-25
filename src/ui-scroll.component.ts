import { Component,
  OnInit, OnDestroy,
  TemplateRef, ElementRef, Renderer2,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import template from './ui-scroll.component.html';
import style from './ui-scroll.component.css';

import { initialize, dispose } from './component/index';
import { Datasource, Item } from './component/models/index';

@Component({
  selector: 'ui-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: template + '',
  styles: [style + '']
})
export class UiScrollComponent implements OnInit, OnDestroy {

  // come from the directive
  public template: TemplateRef<any>;
  public datasource: Datasource;

  // use in the template
  public items: Array<Item>;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    initialize(this);
  }

  ngOnDestroy() {
    dispose(this);
  }
}
