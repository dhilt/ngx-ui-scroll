import { Component } from '@angular/core';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType
} from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { IDatasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-basic',
  templateUrl: './basic.component.html',
  standalone: false
})
export class DemoBasicComponent {
  demoContext: DemoContext = {
    config: demos.settings.map.noSettings,
    viewportId: 'no-settings-viewport',
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackInfinite(this.demoContext)
  };

  sources: DemoSources = [
    {
      name: DemoSourceType.Datasource,
      text: `datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
}`
    },
    {
      name: DemoSourceType.Template,
      text: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
    },
    {
      name: DemoSourceType.Styles,
      text: `.viewport {
  width: 150px;
  height: 250px;
  overflow-y: auto;
}
.item {
  font-weight: bold;
  height: 25px;
}`
    }
  ];
}
