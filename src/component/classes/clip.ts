export class ClipByDirection {
  shouldClip: boolean;
  size: number | null;
  items: number | null;

  constructor() {
    this.reset();
  }

  reset() {
    this.shouldClip = false;
    this.size = null;
    this.items = null;
  }
}

export class ClipModel {
  forward: ClipByDirection;
  backward: ClipByDirection;

  constructor() {
    this.forward = new ClipByDirection();
    this.backward = new ClipByDirection();
    this.reset();
  }

  reset() {
    this.backward.reset();
    this.forward.reset();
  }

  get shouldClip(): boolean {
    return this.forward.shouldClip || this.backward.shouldClip;
  }
}
