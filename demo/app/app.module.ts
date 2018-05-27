import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap';

import { UiScrollModule } from '../../public_api'; // from 'ngx-ui-scroll';

import { AppComponent } from './app.component';
import { NavComponent } from './shared/nav.component';
import { DemoComponent } from './shared/demo.component';

import { CommonComponent } from './samples/common.component';
import { AdapterComponent } from './samples/adapter.component';

import { DemoBasicComponent } from './samples/common/basic.component';
import { DemoBufferSizeComponent } from './samples/common/buffer-size.component';
import { DemoPaddingComponent } from './samples/common/padding.component';
import { DemoStartIndexComponent } from './samples/common/start-index.component';
import { DemoInfiniteComponent } from './samples/common/infinite.component';
import { DemoHorizontalComponent } from './samples/common/horizontal.component';
import { DemoDifferentHeightsComponent } from './samples/common/different-heights.component';
import { DemoReloadComponent } from './samples/adapter/reload.component';
import { DemoIsLoadingComponent } from './samples/adapter/is-loading.component';
import { WindowComponent } from './samples/window.component';
import { TestComponent } from './samples/test.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DemoComponent,
    CommonComponent,
    AdapterComponent,
    DemoBasicComponent,
    DemoBufferSizeComponent,
    DemoPaddingComponent,
    DemoStartIndexComponent,
    DemoInfiniteComponent,
    DemoHorizontalComponent,
    DemoDifferentHeightsComponent,
    DemoReloadComponent,
    DemoIsLoadingComponent,
    WindowComponent
    DemoIsLoadingComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    TabsModule.forRoot(),
    UiScrollModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
