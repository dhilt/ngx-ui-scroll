import {Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, Input} from '@angular/core';
import {ContentChild, TemplateRef, ElementRef, Renderer2} from '@angular/core';
import {HostListener} from '@angular/core';

import {UiScrollService} from './ui-scroll.service';

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
  templateUrl: './ui-scroll.component.html'
})
export class UiScrollComponent implements OnInit, OnDestroy {

  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;
  private onScrollListener: Function;
  private datasource;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private uiScrollService: UiScrollService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.datasource = this.uiScrollService.getDatasource();
    console.log(this.templateVariable) // ! undefined
    // Elements.initialize(this.elementRef);
    // Data.initialize(this);
    // Workflow.initialize(this);
    // this.onScrollListener = this.renderer.listen(Elements.viewport, 'scroll', (event) =>
    //   debouncedRound(() => Workflow.run(event), 25)
    // );
    // Workflow.run(Direction.bottom);
    // Workflow.run(Direction.top);
    // console.log(this);
    // console.log(this.elementRef.nativeElement.innerHTML.trim());
    // console.log(this.templateVariable);  // Here should be info from app.component.html..?
  }

  ngOnDestroy() {
    this.onScrollListener();
  }
}
