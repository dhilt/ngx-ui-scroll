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
  pending = false;

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
      if(!item.element) { // todo: just remove this
        throw new Error('Can not associate item with element');
      }
    });
  }

  render(items = null) {
    setTimeout(() => {
      if(items) {
        this.setElements(items); 
      }
      this.wantMore();
    });
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

  wantMore() {
    if(this.pending || !this.shouldLoadBottom()) {
      return;
    }    
    this.pending = true;
    this.datasource.get(this.start, this.count, (result) => {
      this.pending = false;
      this.eof = result.length !== this.count;

      let items = result.map((item, index) => ({
        $index: this.start + index,
        scope: item
      }));

      this.start += this.count;
      this.data = [...this.data, ...items];

      this.render(items);
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
      this.render();
    }
    else {
      this.wantMore();
    }
  }  

  ngOnInit() {
    this.viewport = this.elementRef.nativeElement;
    this.paddingTop = this.viewport.querySelector('[data-padding-top]');
    this.paddingBottom = this.viewport.querySelector('[data-padding-bottom]');
    this.onScrollListener = this.renderer.listen(this.viewport, 'scroll', this.adjust.bind(this));
    this.wantMore();
  }

}
