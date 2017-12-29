import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UiScrollModule } from './ui-scroll-directive/ui-scroll.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    UiScrollModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
