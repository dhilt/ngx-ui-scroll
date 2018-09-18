import { Component } from '@angular/core';

import { IDatasource } from '../../../public_api'; // from 'ngx-ui-scroll';

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
      const start = Math.max(index, -49);
      const end = start + count;
      const data = [];
      if (start < end) {
        for (let i = start; i <= index + count - 1; i++) {
          data.push({ id: i, text: 'item #' + i });
        }
      }
      success(data);
    },
    settings: {
      startIndex: 1,
      padding: 0.25,
      itemSize: 20,
      minIndex: -49,
      maxIndex: 150,
      windowViewport: true
    },
    devSettings: {
      debug: true
    }
  };

}
