import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private title = 'app works!';

  private datasource = {
      get: (index: number, count: number, success) => {
        console.log('requested index = ' + index + ', count = ' + count);
        setTimeout(() => {
          let result = [];
          for (let i = index; i <= index + count - 1; i++) {
            result.push({
              id: i,
              text: "item #" + i
            });
          }
          console.log('resolved ' + result.length + ' items (index = ' + index + ', count = ' + count + ')');
          success(result);
        }, 50);
      }
    };

  constructor() {
  }

}
