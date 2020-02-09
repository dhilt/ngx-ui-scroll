import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TabsModule } from 'ngx-bootstrap';

import { UiScrollModule } from '../../public_api'; // from 'ngx-ui-scroll';

import { AppComponent } from './app.component';
import { NavComponent } from './shared/nav.component';
import { DemoComponent } from './shared/demo.component';

import { HomeComponent } from './samples/home.component';
import { SettingsComponent } from './samples/settings.component';
import { AdapterComponent } from './samples/adapter.component';
import { DatasourceComponent } from './samples/datasource.component';
import { ExperimentalComponent } from './samples/experimental.component';

import { DemoBasicComponent } from './samples/common/basic.component';
import { DemoBufferSizeComponent } from './samples/common/buffer-size.component';
import { DemoPaddingComponent } from './samples/common/padding.component';
import { DemoItemSizeComponent } from './samples/common/item-size.component';
import { DemoStartIndexComponent } from './samples/common/start-index.component';
import { DemoMinMaxIndexesComponent } from './samples/common/min-max-indexes.component';
import { DemoInfiniteComponent } from './samples/common/infinite.component';
import { DemoHorizontalComponent } from './samples/common/horizontal.component';
import { DemoDifferentHeightsComponent } from './samples/common/different-heights.component';
import { DemoWindowViewportComponent } from './samples/common/window-viewport.component';
import { DemoReloadComponent } from './samples/adapter/reload.component';
import { DemoIsLoadingComponent } from './samples/adapter/is-loading.component';
import { DemoItemsCountComponent } from './samples/adapter/items-count.component';
import { DemoBofEofComponent } from './samples/adapter/bof-eof.component';
import { DemoFirstLastVisibleItemsComponent } from './samples/adapter/first-last-visible-items.component';
import { DemoAppendPrependComponent } from './samples/adapter/append-prepend.component';
import { DemoAppendPrependSyncComponent } from './samples/adapter/append-prepend-sync.component';
import { DemoIsLoadingExtendedComponent } from './samples/adapter/is-loading-extended.component';
import { DemoCheckSizeComponent } from './samples/adapter/check-size.component';
import { DemoRemoveComponent } from './samples/adapter/remove.component';
import { DemoClipComponent } from './samples/adapter/clip.component';
import { DemoDatasourceSignaturesComponent } from './samples/datasource/datasource-signatures.component';
import { DemoBidirectionalUnlimitedDatasourceComponent } from './samples/datasource/bidirectional-unlimited-datasource.component';
import { DemoLimitedDatasourceComponent } from './samples/datasource/limited-datasource.component';
import { DemoPositiveLimitedDatasourceComponent } from './samples/datasource/positive-limited-datasource.component';
import { RemoteDataService, DemoRemoteDatasourceComponent } from './samples/datasource/remote-datasource.component';
import { DemoInvertedDatasourceComponent } from './samples/datasource/inverted-datasource.component';
import { DemoPagesDatasourceComponent } from './samples/datasource/pages-datasource.component';
import { WindowComponent } from './samples/window.component';
import { TestComponent, TestInnerComponent } from './samples/test.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DemoComponent,
    HomeComponent,
    SettingsComponent,
    AdapterComponent,
    DatasourceComponent,
    ExperimentalComponent,
    DemoBasicComponent,
    DemoBufferSizeComponent,
    DemoPaddingComponent,
    DemoItemSizeComponent,
    DemoStartIndexComponent,
    DemoMinMaxIndexesComponent,
    DemoInfiniteComponent,
    DemoHorizontalComponent,
    DemoDifferentHeightsComponent,
    DemoWindowViewportComponent,
    DemoReloadComponent,
    DemoIsLoadingComponent,
    DemoItemsCountComponent,
    DemoBofEofComponent,
    DemoFirstLastVisibleItemsComponent,
    DemoAppendPrependComponent,
    DemoAppendPrependSyncComponent,
    DemoIsLoadingExtendedComponent,
    DemoCheckSizeComponent,
    DemoRemoveComponent,
    DemoClipComponent,
    DemoDatasourceSignaturesComponent,
    DemoBidirectionalUnlimitedDatasourceComponent,
    DemoLimitedDatasourceComponent,
    DemoPositiveLimitedDatasourceComponent,
    DemoRemoteDatasourceComponent,
    DemoInvertedDatasourceComponent,
    DemoPagesDatasourceComponent,
    WindowComponent,
    TestComponent,
    TestInnerComponent
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
