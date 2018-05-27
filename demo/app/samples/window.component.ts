import { Component } from '@angular/core';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-samples-window',
  templateUrl: './window.component.html'
})
export class WindowComponent {

  constructor() {
  }

  datasource: Datasource = {
    get: (index: number, count: number, success: Function) => {
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      setTimeout(success(data), 125);
    },
    settings: {
      bufferSize: 10,
      windowViewport: true
    },
    devSettings: {
      debug: true
    }
  };

}
