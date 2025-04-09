import { Component } from '@angular/core';

import { demos } from '../routes';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: false
})
export class NavComponent {
  demos = demos;

  constructor() {}
}
