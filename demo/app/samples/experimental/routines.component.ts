import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';

import { Datasource, Routines } from 'ngx-ui-scroll';

const getCustomRoutines = (context: DemoRoutinesComponent) =>
  class extends Routines {
    render(...args: Parameters<Routines['render']>) {
      if (context.log) {
        context.logText += `${JSON.stringify(args[1].items)}\n`;
        console.log('Items to render:', args[1].items);
      }
      // pass by the original render
      return super.render(...args);
    }
  };

@Component({
  selector: 'app-routines',
  templateUrl: './routines.component.html',
  standalone: false
})
export class DemoRoutinesComponent {
  demoConfig = demos.experimental.map.routines;

  MIN = -99;
  MAX = 100;
  data: MyItem[] = [];
  log = false;
  logText = '';
  CustomRoutines = getCustomRoutines(this);

  constructor() {
    // setTimeout(() => (this.log = true), 2000);
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      index -= this.MIN; // convert to natural indexes starting with 0
      const start = Math.max(0, index);
      const end = Math.min(this.MAX - this.MIN + 1, index + count);
      const data = start > end ? [] : this.data.slice(start, end);
      success(data);
    }
  });

  sources: DemoSources = [
    {
      active: true,
      name: DemoSourceType.Template,
      text: `<input type="checkbox" [(ngModel)]="log" />
{{ log ? 'disable' : 'enable' }} render log
      
<div class="viewport">
  <div *uiScroll="let item of datasource; Routines: CustomRoutines">
    <div class="item">
      {{ item.text }}
    </div>
  </div>
</div>`
    },
    {
      name: DemoSourceType.Component,
      text: `import { Datasource, Routines } from 'ngx-ui-scroll';

const getCustomRoutines = (context: DemoRoutinesComponent) =>
  class extends Routines {
    render(...args: Parameters<Routines['render']>) {
      if (context.log) { // the context of the demo component
        console.log(args[1].items);
      }
      // pass by the original render
      return super.render(...args);
    }
  };

@Component({ ... })
export class DemoRoutinesComponent {
  MIN = -99;
  MAX = 100;
  data: MyItem[] = [];
  log = false;
  CustomRoutines = getCustomRoutines(this);

  constructor() {
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      index -= this.MIN; // convert to natural indexes starting with 0
      const start = Math.max(0, index);
      const end = Math.min(this.MAX - this.MIN + 1, index + count);
      const data = start > end ? [] : this.data.slice(start, end);
      success(data);
    }
  });
}`
    }
  ];
}
