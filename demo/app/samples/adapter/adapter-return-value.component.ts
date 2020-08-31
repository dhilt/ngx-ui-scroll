import { Component } from '@angular/core';

import { DemoContext } from '../../shared/interfaces';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-adapter-return-value',
  templateUrl: './adapter-return-value.component.html'
})
export class DemoAdapterReturnValueComponent {
  demoContext = {
    scope: 'adapter',
    title: `Return value`,
    titleId: `return-value`,
    noWorkView: true
  } as DemoContext;

  returnValueType = `  Promise<{
    success: boolean,
    immediate: boolean,
    error?: string
  }>`;

  returnValueSample = `
  const { immediate } = await adapter.remove(predicate);
  if (immediate) {
    console.log('No items were removed');
  }`;
}
