import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  private datasource = {
      get: (index: number, count: number, success) => {
        setTimeout(() => {
          let result = [];
          for (let i = index; i <= index + count - 1; i++) {
            result.push({
              id: i,
              text: "item #" + i
            });
          }
          success(result);
        }, 50);
      }
    };

  constructor() {
  }

}
