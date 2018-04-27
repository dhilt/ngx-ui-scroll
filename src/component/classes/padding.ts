import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';

export class Padding {

  element = null;
  direction: Direction;
  routines: Routines;

  constructor(element, direction: Direction, routines: Routines, initialSize?: number) {
    this.element = element.querySelector(`[data-padding-${direction}]`);
    this.direction = direction;
    this.routines = routines;
    if (initialSize) {
      this.routines.setSizeStyle(this.element, initialSize);
    }
  }

  reset() {
    this.size = 0;
  }

  get size(): number {
    return this.routines.getSizeStyle(this.element);
  }

  set size(value: number) {
    this.routines.setSizeStyle(this.element, Math.round(value));
  }

  getEdge(): number {
    return this.routines.getEdge(this.element, this.direction, true);
  }

}
