import { Component } from '@angular/core';

import { DemoSources } from '../shared/interfaces';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  reloadIndex = 999;
  delay = 25;

  datasource = new Datasource({
    get: (index, count, success) => {
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

  sources: DemoSources = {
    datasource: `delay = 25;
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
}`,
    template: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>

<!-- adapter props and methods: -->

First visible:
{{datasource.adapter.firstVisible.data.text}}

Last visible:
{{(datasource.adapter.lastVisible$ | async)?.data.text}}

Items in DOM:
{{datasource.adapter.itemsCount}}

Is loading:
{{datasource.adapter.isLoading}}

Datasource delay (ms):
<input [(ngModel)]="delay" type="number">

Index to reload:
<input [(ngModel)]="reloadIndex" type="number">
<button (click)="doReload()">Reload</button>`,
    styles: `.viewport {
  width: 150px;
  height: 250px;
  overflow-y: auto;
  overflow-anchor: none;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  };

  constructor() {
  }

  doReload() {
    this.datasource.adapter.reload(this.reloadIndex);
  }

}
