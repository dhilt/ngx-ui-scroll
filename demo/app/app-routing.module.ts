import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './samples/home.component';
import { SettingsComponent } from './samples/settings.component';
import { AdapterComponent } from './samples/adapter.component';
import { DatasourceComponent } from './samples/datasource.component';
import { ExperimentalComponent } from './samples/experimental.component';
import { WindowComponent } from './samples/window.component';
import { TestComponent } from './samples/test.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'adapter', component: AdapterComponent },
  { path: 'datasource', component: DatasourceComponent },
  { path: 'experimental', component: ExperimentalComponent },
  { path: 'window', component: WindowComponent },
  { path: 'test', component: TestComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
