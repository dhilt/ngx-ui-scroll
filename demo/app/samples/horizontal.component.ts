import { Component } from '@angular/core';
import { DemoData, DemoSources } from '../shared/interfaces';

import { Datasource } from '../../../public_api';
// import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-horizontal',
  templateUrl: './horizontal.component.html'
})
export class DemoHorizontalComponent {

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
    },
    settings: {
      horizontal: true
    }
  };

  data: DemoData = {
    title: `Horizontal mode`,
    titleId: `horizontal-mode`,
    id: `horizontal`,
    addClass: `horizontal`
  };

  sources: DemoSources = {
    datasource: `datasource: Datasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    horizontal: true
  }
}`,
    template: `<div class="viewport horizontal">
  <div *uiScroll="let item of datasource">
    <div class="item horizontal">{{item.text}}</div>
  </div>
</div>`,
    styles:`.viewport.horizontal {
  width: 175px;
  height: 100px;
  overflow-anchor: none;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
}
.viewport.horizontal div {
  display: inline-block;
}
.item.horizontal {
  border: 1px solid #aaa;
  height: 100px;
  padding: 0 5px;
  font-weight: bolder;
}`
  };

}
