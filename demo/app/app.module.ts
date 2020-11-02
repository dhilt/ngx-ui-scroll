import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { UiScrollModule } from '../../public_api'; // from 'ngx-ui-scroll';

import { AppComponent } from './app.component';
import { NavComponent } from './shared/nav.component';
import { DemoTitleComponent } from './shared/demo/demo-title.component';
import { DemoSourcesComponent } from './shared/demo/demo-sources.component';
import { DemoComponent } from './shared/demo.component';

import { HomeComponent } from './samples/home.component';
import { SettingsComponent } from './samples/settings.component';
import { AdapterComponent } from './samples/adapter.component';
import { DatasourceComponent } from './samples/datasource.component';
import { ExperimentalComponent } from './samples/experimental.component';
import { WindowComponent } from './samples/window.component';
import { TestComponent, TestInnerComponent } from './samples/test.component';

import demos from './demos';

import { RemoteDataService } from './samples/datasource/remote-datasource.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DemoTitleComponent,
    DemoSourcesComponent,
    DemoComponent,
    HomeComponent,
    SettingsComponent,
    AdapterComponent,
    DatasourceComponent,
    ExperimentalComponent,
    WindowComponent,
    TestComponent,
    TestInnerComponent,
    ...demos.common,
    ...demos.datasource,
    ...demos.adapter,
    ...demos.experimental,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TabsModule.forRoot(),
    UiScrollModule,
    AppRoutingModule
  ],
  providers: [
    RemoteDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
