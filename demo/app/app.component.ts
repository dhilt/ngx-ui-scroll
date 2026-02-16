import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent implements OnDestroy {
  hasLayout = true;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router) {
    this.subscriptions.push(
      router.events
        .pipe(filter((event: Event) => event instanceof NavigationStart))
        .subscribe((event: Event) => {
          const url = (event as NavigationStart).url;
          this.hasLayout = !(url === '/window' || url === '/test');
          if (url === '/window') {
            document.body.classList.add('entire-window');
          } else {
            document.body.classList.remove('entire-window');
          }
          if (!url.includes('#')) {
            window.scrollTo(0, 0);
          }
        })
    );
    this.subscriptions.push(
      router.events
        .pipe(filter((event: Event) => event instanceof NavigationEnd))
        .subscribe((event: Event) => {
          const tree = router.parseUrl(
            (event as NavigationEnd).urlAfterRedirects
          );
          const hash = tree.fragment;
          if (hash) {
            setTimeout(() => {
              const cmp = document.getElementById(hash);
              if (cmp) {
                cmp.scrollIntoView();
              }
            });
          } else {
            window.scrollTo(0, 0);
          }
        })
    );
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) =>
      subscription.unsubscribe()
    );
  }
}
