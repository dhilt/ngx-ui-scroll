import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { UiScrollModule } from '../../public_api';
// import { UiScrollModule } from 'ngx-ui-scroll';

@NgModule({
  declarations: [AppComponent],
  imports: [
    TabsModule.forRoot(),
    BrowserModule,
    UiScrollModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

