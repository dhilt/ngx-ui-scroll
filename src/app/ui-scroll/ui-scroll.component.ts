import { Component, OnInit, Input } from '@angular/core';
import { ContentChild, TemplateRef, ElementRef, Renderer } from '@angular/core';
import { HostListener } from "@angular/core";

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AsyncSubject } from 'rxjs/AsyncSubject';

let Direction = {
  top: 'top',
  bottom: 'bottom'
}

@Component({
  selector: 'ui-scroll',
  templateUrl: './ui-scroll.component.html',
  styleUrls: ['./ui-scroll.component.css']
})

export class UiScrollComponent implements OnInit {

  @Input() datasource;
  @ContentChild(TemplateRef) templateVariable: TemplateRef<any>;

  viewport;
  paddingTop;
  paddingBottom;
  onScrollListener: Function;

  token = 'ui-scroll-0';
  tokenItem = 'ui-scroll-0-item-';

  data = [];
  start = 0;
  count = 5;
  bof = false;
  eof = false;

  datasourceSubject = new Subject<any>();
  datasourceSubscriber;

  constructor(private elementRef: ElementRef, private renderer: Renderer) {
  }

  setElements(items) {
    items.forEach(item => {
      for(let i = this.viewport.childNodes.length - 1; i >= 0; i--) {
        let node = this.viewport.childNodes[i];
        if(node.id) {
          if(node.id === this.tokenItem + item.$index) {
            item.element = node;
          }
        }
      }
      if(!item.element) {
        throw new Error('Can not associate item with element');
      }
    });
  }

  process(result) {
    if (result.direction === Direction.bottom) {
      this.data = [...this.data, ...result.items];
      //data.items.sort((a, b) => (a.$index > b.$index) ? 1 : ((a.$index > b.$index) ? -1 : 0));
      if(result.items.length !== this.count) {
        this.eof = true;
        return;
      }
      setTimeout(() => {
        this.setElements(result.items);
        this.fetch();
      });
    }
  }

  shouldLoadBottom() {
    if(!this.data.length) {
      return true;
    }
    let lastElement = this.data[this.data.length - 1].element;
    let viewportBottom = this.viewport.getBoundingClientRect().bottom;
    let lastElementBottom = lastElement.getBoundingClientRect().bottom;
    return lastElementBottom <= viewportBottom;
  }

  pending = false;

  fetch() {
    if(this.pending || !this.shouldLoadBottom()) {
      return;
    }    
    this.pending = true;
    this.datasource.get(this.start, this.count, (result) => {
      this.pending = false;
      let data = {
        items: result
          .map((item, index) => ({
            $index: this.start + index,
            scope: item
          })),
        direction: Direction.bottom
      };
      this.start += this.count;
      this.datasourceSubject.next(data);
    });
   }

  adjust() {
    let viewportTop = this.viewport.getBoundingClientRect().top;
    let topVisibleItemIndex = null;
    for(let i = 0; i < this.data.length; i++) {
      let elementParams = this.data[i].element.getBoundingClientRect();
      if(elementParams.bottom >= viewportTop) {
        topVisibleItemIndex = i;
        break;
      }
    }
    if(topVisibleItemIndex > 0) {
      let firstElementTop = this.data[0].element.getBoundingClientRect().top;
      let lastElementBottom = this.data[topVisibleItemIndex - 1].element.getBoundingClientRect().bottom;
      let cutHeight = lastElementBottom - firstElementTop;
      let height = parseInt(this.paddingTop.style.height, 10) || 0;
      this.paddingTop.style.height = (height + cutHeight) + 'px';

      this.data.splice(0, topVisibleItemIndex); 
      setTimeout(() => {
        this.fetch();
      });
    }
    else {
      this.fetch();
    }
  }

  ngOnInit() {
    this.viewport = this.elementRef.nativeElement;
    this.paddingTop = this.viewport.querySelector('[data-padding-top]');
    this.paddingBottom = this.viewport.querySelector('[data-padding-bottom]');

    this.datasourceSubscriber = this.datasourceSubject.subscribe(this.process.bind(this));
    this.onScrollListener = this.renderer.listen(this.viewport, 'scroll', this.adjust.bind(this));

    this.fetch();
  }

  ngOnDestroy() {
    this.datasourceSubscriber.unsubscribe();
  }

}
