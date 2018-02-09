import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Datasource } from '../../public_api';
//import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'app works!';

  public datasource: Datasource = {
    get: (index: number, count: number) => Observable.create(observer => {
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
      }, 75);
    })
  };

  constructor() {
  }

}
