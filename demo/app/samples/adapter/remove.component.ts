import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-remove',
  templateUrl: './remove.component.html'
})
export class DemoRemoveComponent {

  demoContext: DemoContext = {
    scope: 'adapter',
    title: `Remove`,
    titleId: `remove`,
    viewportId: `remove-viewport`,
    addClass: `remove`,
    count: 0,
    log: ''
  };

  MIN = -50;
  MAX = 50;
  data: any[];
  inputValue = 5;

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource({
    get: (index: number, count: number, success: Function) => {
      let data = [];
      const shift = -Math.min(this.MIN, 0);
      const start = Math.max(index + shift, 0);
      const end = Math.min(index + count - 1, this.MAX) + shift;
      if (start <= end) {
        data = this.data.slice(start, end + 1);
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = -50;
MAX = 50;
data: any[];
inputValue = 5;

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ id: i, text: 'item #' + i });
  }
}

datasource = new Datasource({
  get: (index: number, count: number, success: Function) => {
    const shift = -Math.min(this.MIN, 0);
    const start = Math.max(index + shift, 0);
    const end = Math.min(index + count - 1, this.MAX) + shift;
    success(start <= end
      ? this.data.slice(start, end + 1)
      : []
    );
  }
});

removeFromDatasource(toRemove: number, byIndex = false) {
  const indexToRemove = byIndex
    ? toRemove - Math.min(this.MIN, 0) // shift!
    : this.data.findIndex(({ id }) => id === toRemove);
  if (indexToRemove >= 0) {
    this.data.splice(indexToRemove, 1);
  }
  this.MAX--;
}

async removeById(id: number) {
  this.removeFromDatasource(id);
  await this.datasource.adapter.remove({
    predicate: ({ data }) => data.id === id
  });
}

async removeByIndex(index: number) {
  this.removeFromDatasource(index, true);
  await this.datasource.adapter.remove({
    predicate: ({ $index }) => $index === index
  });
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `<input [(ngModel)]="inputValue" size="3">
<button (click)="removeByIndex(inputValue)">
  Remove by index
</button>

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">
      {{item.text}}
      <span class="remove" (click)="removeById(item.id)">
        [remove]
      </span>
    </div>
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

  argumentsDescription = `  AdapterRemoveOptions {
    predicate: ItemsPredicate;
    increase?: boolean;
  }`;
  predicateDescription = `  adapter.remove(({ data }) => data.id === id);
  adapter.remove(({ $index }) => $index === index);`;

  onInputChanged(target: HTMLInputElement) {
    const value = parseInt(target.value.trim(), 10);
    target.value = value.toString();
    this.inputValue = value;
  }

  removeFromDatasource(toRemove: number, byIndex = false) {
    const indexToRemove = byIndex
      ? toRemove - Math.min(this.MIN, 0) // shift!
      : this.data.findIndex(({ id }) => id === toRemove);
    if (indexToRemove >= 0) {
      this.data.splice(indexToRemove, 1);
    }
    this.MAX--;
  }

  async removeById(id: number) {
    this.removeFromDatasource(id);
    await this.datasource.adapter.remove({
      predicate: ({ data }) => data.id === id
    });
  }

  async removeByIndex(index: number) {
    this.removeFromDatasource(index, true);
    await this.datasource.adapter.remove({
      predicate: ({ $index }) => $index === index
    });
  }

}
