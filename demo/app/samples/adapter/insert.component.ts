import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources } from '../../shared/interfaces';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-insert',
  templateUrl: './insert.component.html'
})
export class DemoInsertComponent {
  demoConfig = demos.adapterMethods.map.insert;

  MIN = 1;
  MAX = 100;
  data: string[];
  MIN2 = 1;
  MAX2 = 100;
  data2: string[];

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push('item #' + i);
    }
    this.data2 = [];
    for (let i = this.MIN2; i <= this.MAX2; i++) {
      this.data2.push('item #' + i);
    }
  }

  datasource = new Datasource<string>({
    get: (index, count, success) => {
      index -= this.MIN; // convert to natural indexes starting with 0
      const start = Math.max(0, index);
      const end = Math.min(this.MAX - this.MIN + 1, index + count);
      const data = start > end ? [] : this.data.slice(start, end);
      success(data);
    },
    settings: {
      startIndex: this.MIN
    }
  });

  datasource2 = new Datasource<string>({
    get: (index, count, success) => {
      index -= this.MIN2; // convert to natural indexes starting with 0
      const start = Math.max(0, index);
      const end = Math.min(this.MAX2 - this.MIN2 + 1, index + count);
      const data = start > end ? [] : this.data2.slice(start, end);
      success(data);
    },
    settings: {
      startIndex: this.MIN2
    }
  });

  inputCount = '2';
  inputIndex = '3';
  inputCount2 = '2';
  inputIndex2 = '3';

  sources: DemoSources = [
    {
      active: true,
      name: 'Datasource',
      text: `MIN = 1;
MAX = 100;
data: string[] = [];

inputCount = '2';
inputIndex = '3';

constructor() {
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push('item #' + i);
  }
}

datasource = new Datasource<string>({
  get: (index, count, success) => {
    index -= this.MIN; // convert to natural indexes starting with 0
    const start = Math.max(0, index);
    const end = Math.min(this.MAX - this.MIN + 1, index + count);
    const data = start > end ? [] : this.data.slice(start, end);
    success(data);
  },
  settings: {
    startIndex: this.MIN
  }
});
  `
    },
    {
      name: 'Increase',
      text: `
async doInsert() {
  await this.datasource.adapter.relax();
  const count = Number(this.inputCount); // first input
  const itemData = 'item #' + this.inputIndex; // second input
  const index = this.data.indexOf(itemData) + 1;
  if (index < 0 || isNaN(count)) {
    return;
  }
  const items = [];
  for (let i = 1; i <= count; i++) {
    this.MAX++;
    const newItem = itemData + ' ' + Array(i).fill('*').join('');
    items.push(newItem);
  }
  this.data = [
    ...this.data.slice(0, index),
    ...items,
    ...this.data.slice(index)
  ];
  await this.datasource.adapter.insert({
    afterIndex: index,
    items
  });
}
`
    },
    {
      name: 'Decrease',
      text: `
async doInsert() {
  await this.datasource.adapter.relax();
  const count = Number(this.inputCount); // first input
  const itemData = 'item #' + this.inputIndex; // second input
  const index = this.data.indexOf(itemData);
  if (index < 0 || isNaN(count)) {
    return;
  }
  const items = [];
  for (let i = 1; i <= count; i++) {
    this.MIN--;
    const newItem = itemData + ' ' + Array(i).fill('*').join('');
    items.unshift(newItem);
  }
  this.data = [
    ...this.data.slice(0, index),
    ...items,
    ...this.data.slice(index)
  ];
  await this.datasource.adapter.insert({
    before: ({ data }) => data === itemData,
    items,
    decrease: true
  });
}
`
    }
  ];

  argumentsDescription = `  AdapterInsertOptions {
    items: any[];
    before?: ItemsPredicate;
    after?: ItemsPredicate;
    beforeIndex?: number;
    afterIndex?: number;
    decrease?: boolean;
  }`;

  async doInsert() {
    await this.datasource.adapter.relax();
    const itemData = `item #${this.inputIndex}`;
    const index = this.data.indexOf(itemData) + 1;
    const count = Number(this.inputCount);
    if (index < 0 || isNaN(count)) {
      return;
    }
    const items: string[] = [];
    for (let i = 1; i <= count; i++) {
      this.MAX++;
      const newItem = itemData + ' ' + Array(i).fill('*').join('');
      items.push(newItem);
    }
    this.data = [
      ...this.data.slice(0, index),
      ...items,
      ...this.data.slice(index)
    ];
    await this.datasource.adapter.insert({
      afterIndex: index,
      items
    });
  }

  async doInsert2() {
    await this.datasource2.adapter.relax();
    const itemData = `item #${this.inputIndex2}`;
    const index = this.data.indexOf(itemData);
    const count = Number(this.inputCount2);
    if (index < 0 || isNaN(count)) {
      return;
    }
    const items: string[] = [];
    for (let i = 1; i <= count; i++) {
      this.MIN2--;
      const newItem = itemData + ' ' + Array(i).fill('*').join('');
      items.unshift(newItem);
    }
    this.data2 = [
      ...this.data2.slice(0, index),
      ...items,
      ...this.data2.slice(index)
    ];
    await this.datasource2.adapter.insert({
      before: ({ data }) => data === itemData,
      items,
      decrease: true
    });
  }
}
