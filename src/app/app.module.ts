import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UiScrollComponent } from './ui-scroll-directive/ui-scroll.component';
import { UiScrollDirective } from './ui-scroll-directive/ui-scroll.directive';

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
  bootstrap: [AppComponent]
})
export class AppModule { }
