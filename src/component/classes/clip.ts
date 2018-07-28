export class ClipByDirection {
  shouldClip: boolean;
  size: number;
  items: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.shouldClip = false;
    this.size = 0;
    this.items = 0;
  }
}

export class ClipModel {
  shouldClip: boolean;
  forward: ClipByDirection;
  backward: ClipByDirection;

  constructor() {
    this.forward = new ClipByDirection();
    this.backward = new ClipByDirection();
    this.reset();
  }

  reset() {
    this.shouldClip = false;
    this.backward.reset();
    this.forward.reset();
  }

  get size(): number {
    return this.backward.size + this.forward.size;
  }
}
