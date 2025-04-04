import { NgModule } from '@angular/core';

import { UiScrollComponent } from './ui-scroll.component';
import { UiScrollDirective } from './ui-scroll.directive';

const imports = [UiScrollComponent, UiScrollDirective];

@NgModule({
  imports: imports,
  exports: imports
})
export class UiScrollModule {}
