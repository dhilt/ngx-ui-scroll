import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackLimited } from '../../shared/datasource-get';

import { IDatasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-different-heights',
  templateUrl: './different-heights.component.html'
})
export class DemoDifferentHeightsComponent {

  demoContext: DemoContext = <DemoContext> {
    title: `Different item heights`,
    titleId: `different-item-heights`,
    viewportId: `different-heights-viewport`,
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackLimited(this.demoContext, -20, 75)
  };

  sources: DemoSources = {
    datasource: `datasource: IDatasource = {
  get: (index, count, success) => {
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
}`,
    template: `<div class="viewport">
  <div *uiScroll="let item of datasource">
     <div class="item" [style.height]="item.height + 'px'">
      {{item.text}}
     </div>
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
