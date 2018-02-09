import { Direction } from '../interfaces/direction';

export class Padding {

  element = null;

  constructor(element, direction: Direction) {
    this.element = element.querySelector(`[data-padding-${direction}]`);
  }

  get size(): number {
    return parseInt(this.element.style.height, 10);
  }
  set size(value: number) {
    this.element.style.height = `${value}px`;
  }

}
