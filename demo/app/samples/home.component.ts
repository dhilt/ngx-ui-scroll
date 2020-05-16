import { Component } from '@angular/core';

import { DemoSources, DemoSourceType } from '../shared/interfaces';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  reloadIndex = 999;
  delay = 25;

  datasource = new Datasource({
    get: (index: number, count: number, success: Function) => {
      const data: any = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      if (this.delay) {
        setTimeout(() => success(data), this.delay);
      } else {
        success(data);
      }
    },
    settings: {
      padding: 0.5,
      bufferSize: 15,
      itemSize: 25,
      startIndex: 1
    },
    devSettings: {
      debug: false
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `delay = 25;
reloadIndex = 999;

datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    if (this.delay) {
      setTimeout(() => success(data), this.delay);
    } else {
      success(data);
    }
  }
});

doReload() {
  this.datasource.adapter.reload(this.reloadIndex);
}`
  }, {
    name: DemoSourceType.Template,
    text: `<div class="viewport">
  <div *uiScroll="let item of datasource; let even = even">
    <div class="item" [class.even]="even">
      {{item.text}}
    </div>
  </div>
</div>

<!-- adapter props and methods: -->

First visible:
\${{datasource.adapter.firstVisible.$index}}

Last visible:
\${{(datasource.adapter.lastVisible$ | async)?.$index}}

Items in DOM:
{{datasource.adapter.itemsCount}}

Is loading:
{{datasource.adapter.isLoading}}

Datasource delay (ms):
<input [(ngModel)]="delay" type="number">

Index to reload:
<input [(ngModel)]="reloadIndex" type="number">
<button (click)="doReload()">Reload</button>`
  }, {
    name: DemoSourceType.Styles,
    text: `.viewport {
  width: 150px;
  height: 250px;
  overflow-y: auto;
}
.item {
  font-weight: bold;
  height: 25px;
}
.item.even {
  background-color: #f2f2f2;
}`
  }];

  constructor() {
  }

  doReload() {
    this.datasource.adapter.reload(this.reloadIndex);
  }

}
