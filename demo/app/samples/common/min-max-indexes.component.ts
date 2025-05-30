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
  selector: 'app-demo-min-max-indexes',
  templateUrl: './min-max-indexes.component.html',
  standalone: false
})
export class DemoMinMaxIndexesComponent {
  demoContext: DemoContext = {
    config: demos.settings.map.minMaxIndexes,
    viewportId: 'min-max-indexes-viewport',
    count: 0,
    log: ''
  };

  datasourceLimitedDemoConfig = demos.datasource.map.limited;
  datasourcePositiveLimitedDemoConfig =
    demos.datasource.map.positiveLimitedIndexes;

  datasource: IDatasource = {
    get: datasourceGetCallbackInfinite(this.demoContext),
    settings: {
      minIndex: 1,
      maxIndex: 1000
    }
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
  },
  settings: {
    minIndex: 1,
    maxIndex: 1000
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
