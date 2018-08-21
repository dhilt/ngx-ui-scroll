import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';

export class Stub {
  $index: number;
  size: number;
  position: number;

  constructor(index: number, size: number, position: number) {
    this.$index = index;
    this.size = size;
    this.position = position;
  }
}

export class Item {
  $index: number;
  data: any;
  nodeId: string;
  routines: Routines;

  element: HTMLElement;
  size: number;
  invisible: boolean;
  toRemove: boolean;
  stub: Stub | null;

  constructor($index: number, data: any, routines: Routines) {
    this.$index = $index;
    this.data = data;
    this.nodeId = String($index);
    this.routines = routines;
    this.invisible = true;
    this.stub = null;
  }

  setSize() {
    this.size = this.routines.getSize(this.element);
  }

  getEdge(direction: Direction): number {
    return this.routines.getEdge(this.element, direction, false);
  }

  hide() {
    if (this.element) {
      this.routines.hideElement(this.element);
    }
  }

  setStub(size: number, position: number) {
    this.stub = new Stub(this.$index, size, position);
  }
}
