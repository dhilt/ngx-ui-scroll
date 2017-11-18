import {Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, Input} from '@angular/core';
import {ContentChild, TemplateRef, ElementRef, Renderer2} from '@angular/core';
import {HostListener} from '@angular/core';

import { UiScrollService } from './ui-scroll.service';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import Workflow from './modules/workflow';
import Elements from './modules/elements';
import Data from './modules/data';
import Direction from './modules/direction';

import debouncedRound from './modules/debouncedRound';

@Component({
  selector: 'ui-scroll-body',
  template: `
    <h2>{{title}} {{datasource}} </h2>
    <ng-content></ng-content>
  `
})
export class UiScrollComponent implements OnInit {
  private title = 'Hello from ui-scroll body';
  private datasource;

   constructor(
     private uiScrollService: UiScrollService
   ) {
   }

  ngOnInit() {
    this.datasource = this.uiScrollService.getDatasource();
  }
}

/*



@Component({
  selector: 'ui-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-scroll.component.html'
})

export class UiScrollComponent implements OnInit, OnDestroy {

  @Input() datasource;
  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;

  onScrollListener: Function;

  constructor(private changeDetector: ChangeDetectorRef, private elementRef: ElementRef, private renderer: Renderer2) {
  }

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
*/