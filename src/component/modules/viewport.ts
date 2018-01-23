import { ElementRef } from '@angular/core';

export class Viewport {

  element = null;
  paddingTop = null;
  paddingBottom = null;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
    this.paddingTop = this.element.querySelector('[data-padding-top]');
    this.paddingBottom = this.element.querySelector('[data-padding-bottom]');
  }

}
