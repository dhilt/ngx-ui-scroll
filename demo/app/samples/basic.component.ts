import { Component } from '@angular/core';
import { DemoData, DemoSources } from '../shared/interfaces';

import { Datasource } from '../../../public_api';
// import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-basic',
  templateUrl: './basic.component.html'
})
export class DemoBasicComponent {

  count: number = 0;
  log: string = '';

  datasource: Datasource = {
    get: (index, count, success) => {
      this.log = `${++this.count}) get 5 items [${index}, ${index + count - 1}]\n` + this.log;
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  };

  data: DemoData = {
    title: `Unlimited bidirectional scrolling`,
    titleId: `unlimited-bidirectional-scrolling`,
    id: `basic`
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
