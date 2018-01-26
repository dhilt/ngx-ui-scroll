import { ElementRef } from '@angular/core';

export class Viewport {

  element = null;
  paddingBackward = null;
  paddingForward = null;

  disabledScrollEvent: Function;

  constructor(elementRef: ElementRef, disabledScroll: Function) {
    this.element = elementRef.nativeElement;
    this.paddingBackward = this.element.querySelector('[data-padding-backward]');
    this.paddingForward = this.element.querySelector('[data-padding-forward]');
    this.disabledScrollEvent = disabledScroll;
  }

  public changeScrollPosition(value: number) {
    this.disabledScrollEvent();
    this.element.scrollTop += value;
  }

}
