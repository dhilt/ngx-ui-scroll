import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  template: `
    <div *uiScroll="let item of datasource">
      <span>{{item.id}}</span> : <b>{{item.text}}</b>
    </div>
  `
})
export class TestedComponent {
  public datasource: any = {
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
      }, 100);
    })
  };
}
