import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { redirects } from './app/routes';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

const redirect = redirects.find(({ from }) => from === location.hash);
if (redirect) {
  location.href = redirect.to;
} else {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
}

