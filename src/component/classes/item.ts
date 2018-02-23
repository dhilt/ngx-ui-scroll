import { Direction } from '../interfaces/direction';
import { Routines } from '../utils/domRoutines';

export class Item {
  $index: number;
  nodeId: string;
  data: any;
  element: any;

  invisible: boolean;
  toRemove: boolean;

  constructor($index, data, nodeId) {
    this.$index = $index;
    this.data = data;
    this.nodeId = nodeId;
    this.invisible = true;
  }

  getParams() {
    return Routines.getParams(this.element);
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return Routines.getEdge(this.element, direction, opposite);
  }

  hide() {
    Routines.hideElement(this.element);
  }

}
