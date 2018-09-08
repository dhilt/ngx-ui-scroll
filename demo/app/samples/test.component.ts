import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 100;
const MIN = -49;
const MIN_ROW_HEIGHT = 2;

interface MyItem {
  id: number;
  text: string;
  isSelected: boolean;
  height: number;
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
  datasourceDelay = 0;
  data: Array<MyItem>;

  datasource = new Datasource({
    get: (index: number, count: number) =>
      this.fetchData(index, count)
    ,
    settings: {
      padding: 0.25,
      bufferSize: 5,
      minIndex: -49,
      maxIndex: 100,
      itemSize: 20,
      startIndex: 10
    },
    devSettings: {
      debug: true,
      immediateLog: true,
      logTime: false,
      throttle: 140,
      inertia: false,
      inertiaScrollDelay: 125,
      inertiaScrollDelta: 35
    }
  });

  constructor() {
    this.data = [];
    for (let i = 0; i <= MAX - MIN; i++) {
      this.data.push(<MyItem>{
        id: i + MIN,
        text: 'item #' + (i + MIN),
        isSelected: i % 15 === 0,
        height: 20 // Math.max(MIN_ROW_HEIGHT, 20 + i + MIN)
      });
    }
    this.datasource.adapter.firstVisible$
      .subscribe((result) => {
        if (result.data) {
          console.log('...first visible item:', result.data);
        }
      });
  }

  fetchData(index: number, count: number): Observable<Array<MyItem>> {
    const data: Array<MyItem> = [];
    const start = Math.max(MIN, index);
    const end = Math.min(MAX, index + count - 1);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push(this.data[i - MIN]);
      }
    }
    return Observable.create((observer: Observer<any>) => {
      if (!this.datasourceDelay) {
        observer.next(data);
      } else {
        setTimeout(() => observer.next(data), this.datasourceDelay);
      }
    });
  }

  getVisibleItemsCount(): number {
    const adapter = this.datasource.adapter;
    let last = <number>adapter.lastVisible.$index;
    last = Number.isInteger(last) ? last : NaN;
    let first = <number>adapter.firstVisible.$index;
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

  doScrollHome() {
    // this.doScroll(400, 25, 1);
    this.getViewportElement().scrollTop = 0;
  }

  doScrollEnd() {
    this.getViewportElement().scrollTop = 999999;
  }

  doLog() {
    this.datasource.adapter.showLog();
  }

  doToggleItem(item: MyItem) {
    item.isSelected = !item.isSelected;
  }
}
