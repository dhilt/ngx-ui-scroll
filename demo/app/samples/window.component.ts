import { Component } from '@angular/core';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-samples-window',
  templateUrl: './window.component.html'
})
export class WindowComponent {

  init: boolean;

  constructor() {
    setTimeout(() => this.init = true);
  }

  datasource: Datasource = {
    get: (index: number, count: number, success: Function) => {
      const start = Math.max(index, 1);
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
      bufferSize: 10,
      startIndex: 1,
      windowViewport: true
    },
    devSettings: {
      debug: true
    }
  };

}
