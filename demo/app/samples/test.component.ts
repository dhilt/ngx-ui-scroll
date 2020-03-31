import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 50;
let MIN = -199;
const MIN_ROW_HEIGHT = 5;

interface MyItem {
  id: number;
  text: string;
  height: number;
  isSelected: boolean;
  data?: string;
  color?: string;
}

@Component({
  selector: 'app-samples-test-inner',
  template: '<b><ng-content></ng-content></b>'
})
export class TestInnerComponent {
  constructor() {
  }
}

@Component({
  selector: 'app-samples-test',
  templateUrl: './test.component.html'
})
export class TestComponent {

  reloadIndex = 1;
  sizeIndex = 1;
  sizeValue = 10;
  datasourceDelay = 0;
  data: MyItem[];

  datasource = new Datasource({
    get: (index: number, count: number) =>
      this.fetchData(index, count)
    ,
    settings: {
      padding: 0.1,
      bufferSize: 10,
      // minIndex: MIN,
      // maxIndex: MAX,
      itemSize: 100,
      startIndex: 1
    },
    devSettings: {
      debug: true,
      immediateLog: true,
      logTime: false,
      logProcessRun: true,
      throttle: 40,
      changeOverflow: false
    }
  });

  constructor() {
    this.generateData();
    // this.autoscroll();
  }

  generateData() {
    this.data = [];
    for (let i = 0; i <= MAX - MIN; i++) {
      const item: MyItem = {
        id: i + MIN,
        text: 'item #' + (i + MIN),
        isSelected: i % 15 === 0,
        height: Math.max(MIN_ROW_HEIGHT, 20 + i + MIN) // 100
      };
      if (item.isSelected) {
        item.data = Array.from({ length: Math.random() * (10 - 3) + 3 }, (x, j) => '*').join('');
        item.color = i % 30 === 0 ? 'red' : 'black';
      }
      this.data.push(item);
    }
  }

  fetchData(index: number, count: number): Observable<MyItem[]> {
    const data: MyItem[] = [];
    const start = Math.max(MIN, index);
    const end = Math.min(MAX, index + count - 1);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push(this.data[i - MIN]);
        // if (i > 0) {
        //   this.data[i - MIN].height = 25;
        // }
      }
      if (start === MIN) {
        // this.datasource.adapter.setMinIndex(MIN);
      }
    }
    return new Observable((observer: Observer<MyItem[]>) => {
      if (!this.datasourceDelay) {
        observer.next(data);
      } else {
        setTimeout(() => observer.next(data), this.datasourceDelay);
      }
    });
  }

  getVisibleItemsCount(): number {
    const adapter = this.datasource.adapter;
    let last = adapter.lastVisible.$index;
    last = Number.isInteger(last) ? last : NaN;
    let first = adapter.firstVisible.$index;
    first = Number.isInteger(first) ? first : NaN;
    return (Number.isNaN(last) || Number.isNaN(first)) ? 0 : last - first + 1;
  }

  getViewportElement(): Element {
    return document.getElementsByClassName('viewport')[0];
  }

  doScroll(limit: number, delay: number, delta: number) {
    const viewportElement = this.getViewportElement();
    setTimeout(() => {
      viewportElement.scrollTop -= delta;
      if (--limit > 0) {
        this.doScroll(limit, delay, delta);
      }
    }, delay);
  }

  doReload() {
    this.datasource.adapter.reload(this.reloadIndex);
  }

  doPrepend() {
    MIN--;
    const item: MyItem = {
      id: MIN,
      text: 'item #' + MIN,
      isSelected: false,
      height: 25
    };
    this.data.unshift(item);
    this.datasource.adapter.prepend(item);
  }

  doScrollHome() {
    this.getViewportElement().scrollTop = 0;
  }

  doScrollEnd() {
    this.getViewportElement().scrollTop = 999999;
  }

  doScrollSome() {
    const current = this.getViewportElement().scrollTop;
    // this.doScroll(400, 25, 1);
    this.getViewportElement().scrollTop = current + 300;
    // this.datasource.adapter.setScrollPosition(current + 300);
  }

  doChangeSize() {
    const viewportElement = document.getElementById('my-viewport');
    const index = Number(this.sizeIndex);
    if (!isNaN(index) && viewportElement) {
      for (let i = index; i < index + 5; i++) {
        const element = viewportElement.querySelector(`[data-sid="${i}"]`);
        if (element) {
          (element as HTMLElement).style.height = this.sizeValue + 'px';
          const item = this.data.find(_item => _item.id === i);
          if (item) {
            item.height = this.sizeValue;
          }
        }
      }
      this.datasource.adapter.check();
    }
  }

  doLog() {
    this.datasource.adapter.showLog();
  }

  doToggleItem(item: MyItem) {
    this.datasource.adapter.fix({
      updater: (_item) => {
        if (item.id === _item.data.id) {
          _item.data.isSelected = !_item.data.isSelected;
        }
      }
    });
    // item.isSelected = !item.isSelected;
  }

  autoscroll() {
    const { adapter } = this.datasource;
    const isLoadingSubscription = adapter.isLoading$.subscribe(isLoading => {
      const viewportElement = document.getElementById('my-viewport');
      const lastVisible = adapter.lastVisible.element;
      if (!isLoading && viewportElement && lastVisible && lastVisible.getBoundingClientRect) {
        const lastElementBottom = lastVisible.getBoundingClientRect().bottom;
        const viewportBottom = viewportElement.getBoundingClientRect().bottom;
        const toScroll = viewportBottom - lastElementBottom;
        const diff = viewportElement.scrollTop - toScroll;
        if (viewportElement.scrollTop === diff) {
          isLoadingSubscription.unsubscribe();
        } else {
          adapter.fix({ scrollPosition: diff });
          if (viewportElement.scrollTop === diff) {
            isLoadingSubscription.unsubscribe();
          }
        }
      }
    });
  }
}
