import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-remove',
  templateUrl: './remove.component.html'
})
export class DemoRemoveComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Remove`,
    titleId: `remove`,
    viewportId: `remove-viewport`,
    count: 0,
    log: ''
  };

  MIN = -50;
  MAX = 50;
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
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = -50;
MAX = 50;
data: Array<any>;
removeIndex: number = 5;

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
  }
});

doRemoveDatasource(index: number) {
  this.data = this.data.reduce((acc, item) => {
    if (item.id !== index) {
      if (item.id > index) {
        item.id--;
      }
      acc.push(item);
    }
    return acc;
  }, []);
  this.MAX = this.data[this.data.length - 1].id;
}

doRemove() {
  this.doRemoveDatasource(this.removeIndex);
  this.datasource.adapter.remove(item => item.$index === this.removeIndex);
}`
  }, {
    name: DemoSourceType.Template,
    text: `<button (click)="doRemove()">Remove</button>
by index <input [(ngModel)]="removeIndex">

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

  removeIndex = 5;

  onInputChanged(target: HTMLInputElement) {
    let value = parseInt(target.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    target.value = value.toString();
    this.removeIndex = value;
  }

  doRemoveDatasource(index: number) {
    this.data = this.data.reduce((acc, item) => {
      if (item.id !== index) {
        if (item.id > index) {
          item.id--;
        }
        acc.push(item);
      }
      return acc;
    }, []);
    this.MAX = this.data[this.data.length - 1].id;
  }

  doRemove() {
    this.doRemoveDatasource(this.removeIndex);
    this.datasource.adapter.remove(item => item.$index === this.removeIndex);
  }

}
