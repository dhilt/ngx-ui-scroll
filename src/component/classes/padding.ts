import { Direction } from '../interfaces/direction';
import { Routines } from '../utils/domRoutines';

export class Padding {

  element = null;
  direction: Direction;
  horizontal: boolean;

  constructor(element, direction: Direction, horizontal: boolean) {
    this.element = element.querySelector(`[data-padding-${direction}]`);
    this.direction = direction;
    this.horizontal = horizontal;
  }

  get size(): number {
    return parseInt(this.element.style.height, 10) || 0;
  }

  set size(value: number) {
    this.element.style.height = `${value}px`;
  }

  getEdge(): number {
    return Routines.getEdge(this.element, this.direction, true, this.horizontal);
  }

}
