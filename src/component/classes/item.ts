import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';

export class Item {
  $index: number;
  data: any;
  nodeId: string;
  routines: Routines;

  element: any;
  invisible: boolean;
  toRemove: boolean;

  constructor($index, data, nodeId, routines) {
    this.$index = $index;
    this.data = data;
    this.nodeId = nodeId;
    this.routines = routines;
    this.invisible = true;
  }

  getParams() {
    return this.routines.getParams(this.element);
  }

  getEdge(direction: Direction): number {
    return this.routines.getEdge(this.element, direction, false);
  }

  hide() {
    this.routines.hideElement(this.element);
  }

}
