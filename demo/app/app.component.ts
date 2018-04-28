import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private subscription: Subscription;

  constructor(private route: ActivatedRoute) {
  }

  ngAfterViewInit() {
    this.subscription = this.route.fragment.subscribe((hash: string) => {
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
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
