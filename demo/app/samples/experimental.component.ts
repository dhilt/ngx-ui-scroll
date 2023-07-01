import { Component } from '@angular/core';
import { demos } from '../routes';

@Component({
  selector: 'app-experimental',
  templateUrl: './experimental.component.html'
})
export class ExperimentalComponent {
  constructor() {}

  scope = demos.experimental.map;
  base = '../' + demos.experimental.id;

  adapterFixArgumentDescription = `  interface AdapterFixOptions {
    scrollPosition?: number;
    minIndex?: number;
    maxIndex?: number;
    updater?: (item: ItemAdapter, update: () => void) => void;
    scrollToItem?: (item: ItemAdapter) => boolean;
    scrollToItemOpt?: boolean | ScrollIntoViewOptions;
  }`;
}
