import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {

  hasLayout = true;
  private subscriptions: Array<Subscription> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.subscriptions.push(
      router.events.pipe(
        filter((event: Event) => event instanceof NavigationStart)
      ).subscribe((event: Event) => {
        event = <NavigationStart>event;
        this.hasLayout = !(event.url === '/window' || event.url === '/test');
      })
    );
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  ngAfterViewInit() {
    this.subscriptions.push(
      this.route.fragment.subscribe((hash: string) => {
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

}
