import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UiScrollComponent } from './ui-scroll-directive/ui-scroll.component';
import { UiScrollDirective } from './ui-scroll-directive/ui-scroll.directive';
import { UiScrollService } from './ui-scroll-directive/ui-scroll.service';

@NgModule({
  declarations: [
    AppComponent,
    UiScrollComponent,
    UiScrollDirective
  ],
  imports: [
    BrowserModule
  ],
  entryComponents: [UiScrollComponent],
  providers: [UiScrollService],
  bootstrap: [AppComponent]
})
export class AppModule { }
