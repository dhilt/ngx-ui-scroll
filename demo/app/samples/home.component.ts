import { Component, VERSION } from '@angular/core';

import { DemoSources, DemoSourceType, MyItem } from '../shared/interfaces';
import { globalScope as scopes, demoList as demos } from '../routes';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent {
  angularVersion = VERSION.full;
  reloadIndex = 999;
  delay = 0;
  scopes: typeof scopes;
  demos: typeof demos;
  demosNotEmpty: typeof demos;

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const data: MyItem[] = [];
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

  sources: DemoSources = [
    {
      name: DemoSourceType.Template,
      text: `<div class="viewport">
  <div *uiScroll="let item of datasource; let even = even">
    <div class="item" [class.even]="even">
      {{item.text}}
    </div>
  </div>
</div>`
    },
    {
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
    },
    {
      name: 'Adapter',
      text: `Version:
{{datasource.adapter.packageInfo.consumer.version}}

Core:
{{datasource.adapter.packageInfo.core.name}}
v{{datasource.adapter.packageInfo.core.version}}

First visible:
#{{datasource.adapter.firstVisible.$index}}

Last visible:
#{{(datasource.adapter.lastVisible$ | async)?.$index}}

Items in DOM:
{{datasource.adapter.itemsCount}}

Is loading:
{{datasource.adapter.isLoading}}

Datasource delay (ms):
<input [(ngModel)]="delay" type="number">

Index to reload:
<input [(ngModel)]="reloadIndex" type="number">
<button (click)="doReload()">Reload</button>`
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
}
.item.even {
  background-color: #f2f2f2;
}`
    }
  ];

  constructor() {
    this.scopes = scopes;
    this.demos = demos;
    this.demosNotEmpty = demos.filter(({ map }) => map.length);
  }

  doReload() {
    this.datasource.adapter.reload(this.reloadIndex);
  }
}
