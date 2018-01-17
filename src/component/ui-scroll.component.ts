import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';

import debouncedRound from './modules/debouncedRound';
import Direction from './modules/direction';
import Workflow from './modules/workflow';
import Elements from './modules/elements';
import Data from './modules/data';

import template from './ui-scroll.component.html';
import style from './ui-scroll.component.css';

@Component({
  selector: 'app-ui-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: template + '',
  styles: [style + '']
})
export class UiScrollComponent implements OnInit, OnDestroy {

  private onScrollListener: Function;
  public getItems: Function;
  public template: TemplateRef<any>;
  public datasource;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    Elements.initialize(this.elementRef);
    Data.initialize(this);
    Workflow.initialize(this);
    this.onScrollListener = this.renderer.listen(Elements.viewport, 'scroll', (event) =>
      debouncedRound(() => Workflow.run(event), 25)
    );
    Workflow.run(Direction.bottom);
    Workflow.run(Direction.top);
  }

  ngOnDestroy() {
    this.onScrollListener();
  }
}
