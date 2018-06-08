import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-reload',
  templateUrl: './reload.component.html'
})
export class DemoReloadComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Reload`,
    titleId: `reload`,
    viewportId: `reload-viewport`,
    count: 0,
    log: ''
  };

  datasource = new Datasource ({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  sources: DemoSources = {
    datasource: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

reloadIndex: number = 1;

doReload() {
  this.datasource.adapter.reload(this.reloadIndex);
}`,
    template: `<button (click)="doReload()">Reload</button>
<input [(ngModel)]="reloadIndex">

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
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

  reloadIndex = 1;

  onInputChanged(target: HTMLInputElement) {
    let value = parseInt(target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    target.value = value.toString();
    this.reloadIndex = value;
  }

  doReload() {
    this.demoContext.count = 0;
    this.demoContext.log = '';
    this.datasource.adapter.reload(this.reloadIndex);
  }

}
