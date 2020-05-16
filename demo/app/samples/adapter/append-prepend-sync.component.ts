import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-append-prepend-sync',
  templateUrl: './append-prepend-sync.component.html'
})
export class DemoAppendPrependSyncComponent {

  demoContext: DemoContext = {
    scope: 'adapter',
    title: `Append / prepend sync`,
    titleId: `append-prepend-sync`,
    viewportId: `append-prepend-sync-viewport`,
    count: 0,
    log: ''
  };

  MIN = 100;
  MAX = 200;
  data: any[];

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource({
    get: (index: number, count: number, success: Function) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        const found = this.data.find(item => item.id === i);
        if (found) {
          data.push(found);
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    },
    settings: {
      startIndex: this.MIN
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = 100;
MAX = 200;
inputValue = 1;
data: any[];

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ id: i, text: 'item #' + i });
  }
}

datasource = new Datasource({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i < index + count; i++) {
      const found = this.data.find(item => item.id === i);
      if (found) {
        data.push(found);
      }
    }
    success(data);
  },
  settings: {
    startIndex: this.MIN
  }
});

doAppend() {
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.MAX++;
    const newItem = {
      id: this.MAX,
      text: 'item #' + this.MAX + '*'
    };
    this.data.push(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.append(items, true);
}

doPrepend() {
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.MIN--;
    const newItem = {
      id: this.MIN,
      text: 'item #' + this.MIN + '*'
    };
    this.data.unshift(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.prepend(items, true);
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `<button (click)="doAppend()">Append</button> /
<button (click)="doPrepend()">Prepend</button>
<input [(ngModel)]="inputValue" size="2">

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
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
}`
  }];

  inputValue = 1;

  onInputChanged(target: HTMLInputElement) {
    const value = parseInt(target.value.trim(), 10);
    target.value = value.toString();
    this.inputValue = value;
  }

  doAppend() {
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.MAX++;
      const newItem = {
        id: this.MAX,
        text: 'item #' + this.MAX + '*'
      };
      this.data.push(newItem);
      items.push(newItem);
    }
    this.datasource.adapter.append(items, true);
  }

  doPrepend() {
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.MIN--;
      const newItem = {
        id: this.MIN,
        text: 'item #' + this.MIN + '*'
      };
      this.data.unshift(newItem);
      items.push(newItem);
    }
    this.datasource.adapter.prepend(items, true);
  }

}
