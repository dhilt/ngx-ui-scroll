import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 500;
const MIN = -1000;

@Component({
  selector: 'app-samples-test-inner',
  template: '<b><ng-content></ng-content></b>'
})
export class TestInnerComponent {

  constructor() {
  }
}

interface Item {
  id: number;
  text: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-samples-test',
  templateUrl: './test.component.html'
})
export class TestComponent {

  reloadIndex = 1;
  visibleItemsCount: number;
  readonly data: Array<any>;

  constructor() {
    this.data = [];
    for (let i = 0; i <= MAX - MIN; i++) {
      this.data.push(<Item>{
        id: i + MIN,
        text: 'item #' + (i + MIN),
        isSelected: i % 10 === 0
      });
    }
    this.datasource.adapter.firstVisible$
      .subscribe((value) => {
        console.log('..............................first visible item:', value);
      });
  }

  datasource = new Datasource({
    get: (index: number, count: number) =>
      this.fetchData(index, count)
    ,
    settings: {
      bufferSize: 20,
      minIndex: MIN,
      itemSize: 20,
      infinite: false
    },
    devSettings: {
      debug: false,
      throttle: 20
    }
  });

  getVisibleItemsCount(): number {
    const adapter = this.datasource.adapter;
    let last = <number>adapter.lastVisible.$index;
    last = Number.isInteger(last) ? last : NaN;
    let first = <number>adapter.firstVisible.$index;
    first = Number.isInteger(first) ? first : NaN;
    return (Number.isNaN(last) || Number.isNaN(first)) ? 0 : last - first + 1;
  }

  doReload() {
    this.datasource.adapter.reload(this.reloadIndex);
  }

  doScrollHome() {
    const viewportElement = document.getElementsByClassName('viewport')[0];
    const doScroll = (limit: number, delay: number, delta: number) => {
      setTimeout(() => {
        viewportElement.scrollTop -= delta;
        if (--limit > 0) {
          doScroll(limit, delay, delta);
        }
      }, delay);
    };
    // doScroll(400, 25, 1);
    viewportElement.scrollTop = 0;
  }

  doScrollEnd() {
    const viewportElement = document.getElementsByClassName('viewport')[0];
    viewportElement.scrollTop = 999999;
  }

  doToggleItem(item: Item) {
    item.isSelected = !item.isSelected;
  }

  fetchData(index: number, count: number): Observable<Array<Item>> {
    const data: Array<Item> = [];
    const start = Math.max(MIN, index);
    const end = Math.min(MAX, index + count - 1);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push(this.data[i - MIN]);
      }
    }
    return Observable.create((observer: Observer<any>) => {
      // setTimeout(() => observer.next(data), 100);
      observer.next(data);
    });
  }
}
