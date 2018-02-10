import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Datasource } from '../../src/component/interfaces/datasource';

export interface TestComponent {
  datasource: Datasource;
}

@Component({
  template: `
    <div class="viewport">
      <div *uiScroll="let item of datasource">
        <span>{{item.id}}</span> : <b>{{item.text}}</b>
      </div>
    </div>
  `,
  styles: [`
    .viewport {
      width: 200px;
      height: 120px;
      overflow-anchor: none;
      overflow-y: auto;
      display: block;
    }
  `]
})
export class TestedComponent implements TestComponent {
  datasource: Datasource = {
    get: (index: number, count: number) => Observable.create(observer => {
      // console.log('requested index = ' + index + ', count = ' + count);
      setTimeout(() => {
        let data = [];
        for (let i = index; i <= index + count - 1; i++) {
          data.push({
            id: i,
            text: "item #" + i
          });
        }
        observer.next(data);
      }, 15);
    })
  };
}
