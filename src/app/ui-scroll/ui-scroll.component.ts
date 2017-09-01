import {Component, OnInit, Input} from '@angular/core';
import {ContentChild, TemplateRef, ElementRef, Renderer} from '@angular/core';
import {HostListener} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import Process from './processes/index';
import Elements from './elements';
import Data from './data';

@Component({
  selector: 'ui-scroll',
  templateUrl: './ui-scroll.component.html',
  styleUrls: ['./ui-scroll.component.css']
})

export class UiScrollComponent implements OnInit {

  @Input() datasource;
  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;

  onScrollListener: Function;

  constructor(private elementRef: ElementRef, private renderer: Renderer) {
  }

  ngOnInit() {
    Elements.initialize(this.elementRef);
    Data.initialize(this);
    this.onScrollListener = this.renderer.listen(Elements.viewport, 'scroll', Process.render.adjust.bind(this));
    Process.main.run();
  }

}
