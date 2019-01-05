import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-prepend-sync',
  templateUrl: './prepend-sync.component.html'
})
export class DemoPrependSyncComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Prepend sync`,
    titleId: `prepend-sync`,
    viewportId: `prepend-sync-viewport`,
    count: 0,
    log: ''
  };

  MIN = 100;
  MAX = 900;
  data: Array<any>;

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
      doLog(this.demoContext, index, count, data.length);
      success(data);
    },
    settings: {
      startIndex: this.MIN
    },
    devSettings: {
      debug: true
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = 100;
MAX = 900;
inputValue = 1;
data: Array<any>;

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
    name: DemoSourceType.Template,
    text: `<button (click)="doPrepend()">Prepend</button>
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
  overflow-anchor: none;
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
