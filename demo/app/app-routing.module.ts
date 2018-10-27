import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonComponent } from './samples/common.component';
import { AdapterComponent } from './samples/adapter.component';
import { DatasourceComponent } from './samples/datasource.component';
import { WindowComponent } from './samples/window.component';
import { TestComponent } from './samples/test.component';

const routes: Routes = [
  { path: '', component: CommonComponent },
  { path: 'adapter', component: AdapterComponent },
  { path: 'datasource', component: DatasourceComponent },
  { path: 'window', component: WindowComponent },
  { path: 'test', component: TestComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
