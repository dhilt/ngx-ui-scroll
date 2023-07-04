import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiScrollComponent } from './ui-scroll.component';
import { UiScrollDirective } from './ui-scroll.directive';

@NgModule({
  declarations: [UiScrollComponent, UiScrollDirective],
  imports: [CommonModule],
  exports: [UiScrollDirective]
})
export class UiScrollModule {}
