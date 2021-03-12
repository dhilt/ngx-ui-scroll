import { Component } from '@angular/core';

@Component({
  selector: 'app-samples-adapter',
  templateUrl: './adapter.component.html'
})
export class AdapterComponent {

  constructor() {
  }

  datasourceSample = `  import { Datasource } from 'ngx-ui-scroll';

  datasource = new Datasource({ get, settings });`;

  datasourceTypedSample = `datasource = new Datasource<MyItem>({ get, settings });`;

}
