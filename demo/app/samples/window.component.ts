import { Component } from '@angular/core';

import { IDatasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 100;
const MIN = -899;

@Component({
  selector: 'app-samples-window',
  templateUrl: './window.component.html'
})
export class WindowComponent {

  init: boolean;

  constructor() {
    setTimeout(() => this.init = true);
  }

  datasource: IDatasource = {
    get: (index: number, count: number, success: Function) => {
      const start = Math.max(index, MIN);
      const end = Math.min(index + count - 1, MAX);
      const data: any[] = [];
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          const item = <any>{
            text: 'item #' + (i),
            height: 20 // Math.max(MIN_ROW_HEIGHT, 20 + i + MIN)
          };
          if (i % 15 === 0) {
            item.data = Array.from({ length: Math.random() * (10 - 3) + 3 }, (x, j) => '*').join('');
            item.color = i % 30 === 0 ? 'red' : 'black';
          }
          data.push(item);
        }
      }
      // setTimeout(() => success(data), 25);
      success(data);
    },
    settings: {
      startIndex: 1,
      padding: 0.25,
      bufferSize: 1,
      itemSize: 20,
      // minIndex: MIN,
      // maxIndex: MAX,
      windowViewport: true
    },
    devSettings: {
      debug: true,
      immediateLog: true
    }
  };

}
