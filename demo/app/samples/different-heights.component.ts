import { Component } from '@angular/core';
import { DemoData, DemoSources } from '../shared/interfaces';

import { Datasource } from '../../../public_api';
// import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-different-heights',
  templateUrl: './different-heights.component.html'
})
export class DemoDifferentHeightsComponent {

  count: number = 0;
  log: string = '';

  datasource: Datasource = {
    get: (index, count, success) => {
      this.log = `${++this.count}) get 5 items [${index}, ${index + count - 1}]\n` + this.log;
      const MIN = 1, MAX = 75;
      const data = [];
      const start = Math.max(MIN, index);
      const end = Math.min(index + count - 1, MAX);
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ id: i, text: 'item #' + i, height: 20 + i });
        }
      }
      success(data);
    }
  };

  data: DemoData = {
    title: `Different item heights`,
    titleId: `different-item-heights`,
    id: `different-heights`
  };

  sources: DemoSources = {
    datasource: `datasource: Datasource = {
  get: (index, count, success) => {
    const MIN = 1, MAX = 75;
    const data = [];
    const start = Math.max(MIN, index);
    const end = Math.min(index + count - 1, MAX);
    if (start <= end) {
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i, height: 20 + i });
      }
    }
    success(data);
  }
}`,
    template: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div [style.height]="item.height + 'px'">
      <div class="item">{{item.text}}</div>
    </div>
  </div>
</div>`,
    styles:`.viewport {
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
