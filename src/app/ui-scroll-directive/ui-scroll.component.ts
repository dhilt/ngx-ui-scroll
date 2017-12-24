import {Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, Input} from '@angular/core';
import {ContentChild, TemplateRef, ElementRef, Renderer2} from '@angular/core';
import {HostListener} from '@angular/core';

import {AsyncSubject} from 'rxjs/AsyncSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import debouncedRound from './modules/debouncedRound';
import Direction from './modules/direction';
import Workflow from './modules/workflow';
import Elements from './modules/elements';
import Data from './modules/data';

@Component({
  selector: 'ui-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-scroll.component.html',
  styleUrls: [`./ui-scroll.component.css`]
})
export class UiScrollComponent implements OnInit, OnDestroy {

  private onScrollListener: Function;
  public templateVariable;
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
