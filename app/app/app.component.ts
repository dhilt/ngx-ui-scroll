import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Datasource } from '../../public_api';
//import { Datasource } from 'ngx-ui-scroll';

const datasourceGet = {
  'callback': (index: number, count: number, success) => {
    console.log('requested index = ' + index + ', count = ' + count);
    setTimeout(() => {
      let data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({
          id: i,
          text: "item #" + i
        });
      }
      success(data);
    }, 100);
  },
  'observable': (index: number, count: number) => Observable.create(observer => {
    console.log('requested index = ' + index + ', count = ' + count);
    setTimeout(() => {
      let data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({
          id: i,
          text: "item #" + i
        });
      }
      observer.next(data);
    }, 100);
  }),
  'promise': (index: number, count: number) => new Promise((resolve, reject) => {
    console.log('requested index = ' + index + ', count = ' + count);
    setTimeout(() => {
      let data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({
          id: i,
          text: "item #" + i
        });
      }
      resolve(data);
    }, 100);
  })
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'app works!';

  public datasource: Datasource = {
    get: datasourceGet['callback'],
    settings: {
      bufferSize: 5
    }
  };

  constructor() {
  }

}
