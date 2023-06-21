import { Component } from '@angular/core';
import { merge } from 'rxjs';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType,
  MyItem
} from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-bof-eof',
  templateUrl: './bof-eof.component.html'
})
export class DemoBofEofComponent {
  demoContext: DemoContext = {
    config: demos.adapterProps.map.bofEof,
    viewportId: 'bof-eof-viewport',
    count: 0,
    log: ''
  };

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const MIN = 1,
        MAX = 100;
      const data = [];
      const start = Math.max(MIN, index);
      const end = Math.min(index + count - 1, MAX);
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ id: i, text: 'item #' + i });
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    }
  });

  edgeCounter = 0;

  constructor() {
    const { eof$, bof$ } = this.datasource.adapter;
    merge(bof$, eof$).subscribe(() => this.edgeCounter++);
  }

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `datasource = new Datasource<MyItem>({
  get: (index, count, success) => {
    const MIN = 1, MAX = 100;
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
});

edgeCounter = 0;

constructor() {
  const { eof$, bof$ } = this.datasource.adapter;
  merge(bof$, eof$).subscribe(() => this.edgeCounter++);
}
`
    },
    {
      active: true,
      name: DemoSourceType.Template,
      text: `Begin of file is {{datasource.adapter.bof ? '' : 'not'}} reached
<br>
End of file is {{datasource.adapter.eof ? '' : 'not'}} reached
<br>
BOF / EOF changes counter: {{edgeCounter}}

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
}
