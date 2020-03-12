import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource, IDatasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-reset',
  templateUrl: './reset.component.html'
})
export class DemoResetComponent {

  demoContext: DemoContext = <DemoContext>{
    scope: 'adapter',
    title: `Reset`,
    titleId: `reset`,
    viewportId: `reset-viewport`,
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext),
    devSettings: {
      debug: true
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

reloadIndex: number = 99;

doReload() {
  this.datasource.adapter.reload(this.reloadIndex);
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `<button (click)="doReset()">Reset</button>

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }];

  doReset() {
    this.demoContext.count = 0;
    this.demoContext.log = '';
    this.datasource.adapter.reset();
  }

}
