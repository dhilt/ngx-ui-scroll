import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UiScrollModule } from '../../src/ngx-ui-scroll';
//import { UiScrollModule } from 'ngx-ui-scroll';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    UiScrollModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
