import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private title = 'app works!';

  private datasource = {
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
          console.log('resolved ' + data.length + ' items (index = ' + index + ', count = ' + count + ')');
          observer.next(data);
        }, 50);
      })
  };

  constructor() {
  }

}
