import { Component } from '@angular/core';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType
} from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-buffer-info',
  templateUrl: './buffer-info.component.html',
  standalone: false
})
export class DemoBufferInfoComponent {
  demoContext: DemoContext = {
    config: demos.adapterProps.map.bufferInfo,
    viewportId: 'buffer-info-viewport',
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});`
    },
    {
      active: true,
      name: DemoSourceType.Template,
      text: `firstIndex: {{datasource.adapter.bufferInfo.firstIndex}} /
lastIndex: {{datasource.adapter.bufferInfo.lastIndex}} <br>
minIndex: {{datasource.adapter.bufferInfo.minIndex}} /
maxIndex: {{datasource.adapter.bufferInfo.maxIndex}} <br>

<div class="viewport">
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

  bufferInfoType = `interface IBufferInfo {
  firstIndex: number;
  lastIndex: number;
  minIndex: number;
  maxIndex: number;
  absMinIndex: number;
  absMaxIndex: number;
}`;
}
