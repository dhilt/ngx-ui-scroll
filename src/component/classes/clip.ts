import { Direction } from '../interfaces/direction';

export class ClipByDirection {
  shouldClip: boolean;
  size: number;

  constructor() {
    this.shouldClip = false;
    this.size = null;
  }
}

export class ClipModel {
  forward: ClipByDirection;
  backward: ClipByDirection;

  constructor() {
    this.forward = new ClipByDirection();
    this.backward = new ClipByDirection();
  }

  get shouldClip(): boolean {
    return this[Direction.forward].shouldClip || this[Direction.backward].shouldClip;
  }
}
