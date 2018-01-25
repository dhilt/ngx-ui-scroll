import { ElementRef } from '@angular/core';

export class Viewport {

  element = null;
  paddingBackward = null;
  paddingForward = null;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
    this.paddingBackward = this.element.querySelector('[data-padding-backward]');
    this.paddingForward = this.element.querySelector('[data-padding-forward]');
  }

}
