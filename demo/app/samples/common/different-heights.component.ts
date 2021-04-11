import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { datasourceGetCallbackLimited } from '../../shared/datasource-get';

import { IDatasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-different-heights',
  templateUrl: './different-heights.component.html'
})
export class DemoDifferentHeightsComponent {

  demoContext: DemoContext = {
    config: demos.settings.map.differentItemHeights,
    viewportId: 'different-heights-viewport',
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackLimited(this.demoContext, -20, 100)
  };

  sources: DemoSources = [{
    name: DemoSourceType.Datasource,
    text: `datasource: IDatasource = {
  get: (index, count, success) => {
    const MIN = -20, MAX = 100;
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
}`
  }, {
    name: DemoSourceType.Template,
    text: `<div class="viewport">
  <div *uiScroll="let item of datasource">
     <div class="item" [style.height]="item.size + 'px'">
      {{item.text}}
     </div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Styles,
    text: `.viewport {
  width: 150px;
  height: 250px;
  overflow-y: auto;
}
.item {
  font-weight: bold;
}`
  }];

}
