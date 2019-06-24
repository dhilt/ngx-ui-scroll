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

doRemove(index: number) {
  this.doRemoveDatasource(index);
  this.datasource.adapter.remove(item => item.$index === index);
}`
  }, {
    name: DemoSourceType.Template,
    text: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">
      {{item.text}}
      <span class="remove" (click)="doRemove(item.id)">[remove]</span>
    </div>
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
}
.remove {
  font-weight: normal;
  font-size: smaller;
  cursor: pointer;
}
.remove:hover {
  color: rgb(158, 0, 0);
}`
  }];

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

  doRemove(index: number) {
    this.doRemoveDatasource(index);
    this.datasource.adapter.remove(item => item.$index === index);
  }

}
