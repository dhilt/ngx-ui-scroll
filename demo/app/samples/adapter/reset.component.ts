import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-reset',
  templateUrl: './reset.component.html'
})
export class DemoResetComponent {

  demoContext: DemoContext = {
    scope: 'adapter',
    title: `Reset`,
    titleId: `reset`,
    viewportId: `reset-viewport`,
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  startIndex = 100;
  bufferSize = 20;

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

startIndex = 100;
bufferSize = 20;

doReset() {
  const settings = {
    startIndex: Number(this.startIndex),
    bufferSize: Number(this.bufferSize)
  };
  this.datasource.adapter.reset({ settings });
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
      text: `<button (click)="doReset()">Reset</button>
<input [(ngModel)]="startIndex" size="3"> - new start index
<input [(ngModel)]="bufferSize" size="3"> - new buffer size

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }];

  resetWithNewInstanceSample = `  this.datasource.adapter.reset(new Datasource(...));`;

  doReset() {
    this.demoContext.count = 0;
    this.demoContext.log = '';
    const settings = {
      startIndex: Number(this.startIndex),
      bufferSize: Number(this.bufferSize)
    };
    this.datasource.adapter.reset({ settings });
  }

}
