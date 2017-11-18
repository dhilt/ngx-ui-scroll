import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private title = 'app works!';
  private test: Boolean = true;

  private datasource = {
    test: [1,2,3,4,5,6,7,8,7,6,5,4,3,2,1,0],
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
    this.test = true;
  }

}
