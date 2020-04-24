import { Component } from '@angular/core';

@Component({
  selector: 'app-experimental',
  templateUrl: './experimental.component.html'
})
export class ExperimentalComponent {

  constructor() {
  }

  adapterFixArgumentDescription = `  interface AdapterFixOptions {
    scrollPosition?: number;
    minIndex?: number;
    maxIndex?: number;
    updater?: (item: ItemAdapter) => any;
    scrollToItem?: (item: ItemAdapter) => boolean;
    scrollToItemOpt?: boolean | ScrollIntoViewOptions;
  }`;

}
