import { ElementRef } from '@angular/core';

export class Elements {

  viewport = null;
  paddingTop = null;
  paddingBottom = null;

  constructor(elementRef: ElementRef) {
    this.viewport = elementRef.nativeElement;
    this.paddingTop = this.viewport.querySelector('[data-padding-top]');
    this.paddingBottom = this.viewport.querySelector('[data-padding-bottom]');
  }

}
