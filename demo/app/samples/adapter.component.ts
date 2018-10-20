import { Component } from '@angular/core';

@Component({
  selector: 'app-samples-adapter',
  templateUrl: './adapter.component.html'
})
export class AdapterComponent {

  constructor() {
  }


  importSample = `  import { Datasource } from 'ngx-ui-scroll';`;

  datasourceSample = `  datasource = new Datasource({
    get: ... ,
    settings: { ... }
  });`;

}
