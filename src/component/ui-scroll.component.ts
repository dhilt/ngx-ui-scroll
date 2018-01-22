import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';

import template from './ui-scroll.component.html';
import style from './ui-scroll.component.css';

import { initialize, dispose } from '../workflow/index';

@Component({
  selector: 'ui-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: template + '',
  styles: [style + '']
})
export class UiScrollComponent implements OnInit, OnDestroy {

  // come from the directive
  public template: TemplateRef<any>;
  public datasource;

  // use in the template
  public items: Array<any>;

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
