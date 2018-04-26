import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { NavComponent } from './shared/nav.component';
import { DemoComponent } from './shared/demo.component';
import { DemoBasicComponent } from './samples/basic.component';
import { DemoBufferSizeComponent } from './samples/buffer-size.component';
import { DemoPaddingComponent } from './samples/padding.component';
import { DemoInfiniteComponent } from './samples/infinite.component';
import { DemoHorizontalComponent } from './samples/horizontal.component';
import { DemoDifferentHeightsComponent } from './samples/different-heights.component';
import { DemoReloadComponent } from './samples/reload.component';

import { UiScrollModule } from '../../public_api';
// import { UiScrollModule } from 'ngx-ui-scroll';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DemoComponent,
    DemoBasicComponent,
    DemoBufferSizeComponent,
    DemoPaddingComponent,
    DemoInfiniteComponent,
    DemoHorizontalComponent,
    DemoDifferentHeightsComponent,
    DemoReloadComponent
  ],
  imports: [
    TabsModule.forRoot(),
    BrowserModule,
    FormsModule,
    UiScrollModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
