import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { Datasource } from '../../../../public_api';
import { doLog } from '../../shared/datasource-get';

@Component({
  selector: 'app-adapter-relax',
  templateUrl: './adapter-relax.component.html'
})
export class DemoAdapterRelaxComponent {

  demoContext = {
    scope: 'experimental',
    title: `Adapter relax`,
    titleId: `adapter-relax`,
    noInfo: true
  } as DemoContext;

  datasource = new Datasource({
    get: (index: number, count: number, success: Function) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  });

  sources: DemoSources = [{
    active: true,
    name: 'Relax',
    text: `
async doReplace() {
  const { adapter } = this.datasource;
  adapter.remove(({ $index }) =>
    $index > 4 && $index < 8
  );
  await adapter.relax();
  adapter.insert({
    items: [{ id: '5*', text: 'item #5 *' }],
    after: ({ $index }) => $index === 4 }
  );
}
`
}, {
    name: 'Is loading',
    text: `
doReplace() {
  const { adapter } = this.datasource;
  adapter.remove(({ $index }) =>
    $index > 4 && $index < 8
  );
  const insert = () => adapter.insert({
    items: [{ id: '5*', text: 'item #5 *' }],
    after: ({ $index }) => $index === 4 }
  );
  if (!adapter.isLoading) {
    insert();
  } else {
    adapter.isLoading$
      .pipe(filter(isLoading => !isLoading), take(1))
      .subscribe(() => insert());
  }
}
`
}, {
    name: 'Relax cb',
    text: `
doReplace() {
  const { adapter } = this.datasource;
  adapter.remove(({ $index }) =>
    $index > 4 && $index < 8
  );
  adapter.relax(() =>
    adapter.insert({
      items: [{ id: '5*', text: 'item #5 *' }],
      after: ({ $index }) => $index === 4 }
    );
  );
}
`
}, {
    name: 'Return',
    text: `async doReplace() {
  const { adapter } = this.datasource;
  await adapter.remove(({ $index }) =>
    $index > 4 && $index < 8
  );
  adapter.insert({
    items: [{ id: '5*', text: 'item #5 *' }],
    after: ({ $index }) => $index === 4 }
  );
}
`
}];

  isLoadingSample = `
  if (!adapter.isLoading) {
    doSomething();
  } else {
    adapter.isLoading$
      .pipe(filter(isLoading => !isLoading), take(1))
      .subscribe(() => doSomething());
  }`;

  relaxSample = `
  await adapter.relax();
  doSomething();`;

  async doReplace() {
    const { adapter } = this.datasource;
    const newItem = { id: '5*', text: 'item #5 *' };
    adapter.remove(({ $index }) => $index > 4 && $index < 8);
    await adapter.relax();
    adapter.insert({ items: [newItem], after: ({ $index }) => $index === 4 });
  }

}
