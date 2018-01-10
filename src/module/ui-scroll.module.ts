import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiScrollComponent } from '../component/ui-scroll.component';
import { UiScrollDirective } from '../directive/ui-scroll.directive';

@NgModule({
  declarations: [
    UiScrollComponent,
    UiScrollDirective
  ],
  imports: [CommonModule],
  entryComponents: [UiScrollComponent],
  exports: [UiScrollDirective, CommonModule],
  providers: []
})
export class UiScrollModule { }
