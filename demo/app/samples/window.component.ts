import { Component } from '@angular/core';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 500;
const MIN = 1;
const DELAY = 0;

@Component({
  selector: 'app-samples-window',
  templateUrl: './window.component.html'
})
export class WindowComponent {

  init: boolean;

  constructor() {
    setTimeout(() => this.init = true);
  }

  datasource = new Datasource({
    get: (index, count, success) => {
      const start = Math.max(index, MIN);
      const end = Math.min(index + count - 1, MAX);
      const data: any[] = [];
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          const item = {
            data: '',
            text: 'item #' + (i),
            color: 'black',
            height: 20 // Math.max(MIN_ROW_HEIGHT, 20 + i + MIN)
          };
          if (i % 15 === 0) {
            item.data = Array.from({ length: Math.random() * (10 - 3) + 3 }, (x, j) => '*').join('');
            item.color = i % 30 === 0 ? 'red' : 'black';
          }
          data.push(item);
        }
      }
      if (DELAY) {
        setTimeout(() => success(data), DELAY);
      } else {
        success(data);
      }
    },
    settings: {
      startIndex: 100,
      padding: 0.25,
      bufferSize: 1,
      itemSize: 20,
      minIndex: MIN,
      // maxIndex: MAX,
      windowViewport: true
    }
  });

}
