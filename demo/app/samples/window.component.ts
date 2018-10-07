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
          data.push({
            id: i,
            text: 'item #' + i,
            isSelected: i % 15 === 0
          });
        }
      }
      // setTimeout(() => success(data), 25);
      success(data);
    },
    settings: {
      startIndex: 1,
      padding: 0.25,
      itemSize: 20,
      minIndex: MIN,
      maxIndex: MAX,
      windowViewport: true
    },
    devSettings: {
      debug: true
    }
  };

}
