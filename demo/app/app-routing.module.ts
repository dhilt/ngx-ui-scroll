import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonComponent } from './samples/common.component';
import { AdapterComponent } from './samples/adapter.component';

const routes: Routes = [
  { path: '', component: CommonComponent },
  { path: 'adapter', component: AdapterComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
