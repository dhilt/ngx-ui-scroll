import { ElementRef } from '@angular/core'

export default class Elements {

  static viewport = null;
  static paddingTop = null;
  static paddingBottom = null;

  static initialize(elementRef: ElementRef) {
    Elements.viewport = elementRef.nativeElement;
    Elements.paddingTop = Elements.viewport.querySelector('[data-padding-top]');
    Elements.paddingBottom = Elements.viewport.querySelector('[data-padding-bottom]');
  }

}
