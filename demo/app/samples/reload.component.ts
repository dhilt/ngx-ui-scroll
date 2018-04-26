import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DemoData, DemoSources } from '../shared/interfaces';

import { Datasource } from '../../../public_api';
// import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-reload',
  templateUrl: './reload.component.html'
})
export class DemoReloadComponent {

  count: number = 0;
  log: string = '';
  startIndex: number = 1;

  datasourceGet = (index, count) => {
      this.log = `${++this.count}) get 5 items [${index}, ${index + count - 1}]\n` + this.log;
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      return data;
  };

  datasourceGetObservable = (index, count) =>
    Observable.create(observer =>
      observer.next(this.datasourceGet(index, count))
    );

  datasourceGetPromise = (index, count) =>
    new Promise(success =>
      success(this.datasourceGet(index, count))
    );

  datasourceGetCallback = (index, count, success) =>
    success(this.datasourceGet(index, count));

  datasource: Datasource = {
    get: this.datasourceGetObservable
  };

  reload () {
    this.datasource.adapter.reload(this.startIndex);
  }

  onInputChanged (target) {
    let value = parseInt(target.value, 10);
    if(isNaN(value)) {
      value = 1;
    }
    target.value = value;
    this.startIndex = value;
  }

  data: DemoData = {
    title: `Reload`,
    titleId: `reload`,
    id: `reload-viewport`
  };

  sources: DemoSources = {
    datasource: `datasource: Datasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
}`,
    template: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`,
    styles: `.viewport {
  width: 175px;
  height: 175px;
  overflow-y: auto;
  overflow-anchor: none;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  };

}
