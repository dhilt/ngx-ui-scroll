import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 500;
const MIN = 1;

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

  reloadIndex: number = 1;
  private data: Array<any>;

  constructor() {
    this.data = [];
    for (let i = 0; i <= MAX - MIN; i++) {
      this.data.push({
        id: i + MIN,
        text: 'item #' + (i + MIN)
      });
    }
  }

  doReload() {
    // this.data.forEach(item => item.text += '+');
    this.datasource.adapter.reload(this.reloadIndex);
  }

  fetchData(index, count): Observable<Array<any>> {
    const data = [];
    const start = Math.max(MIN, index);
    const end = Math.min(MAX, index + count - 1);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push(this.data[i - MIN]);
      }
    }
    return Observable.create(observer => {
      // setTimeout(() => observer.next(data), 500);
      observer.next(data);
    });
  }

  datasource: Datasource = {
    get: (index, count) =>
      this.fetchData(index, count)
    ,
    settings: {
      bufferSize: 50
    },
    devSettings: {
      debug: true
    }
  };
}
