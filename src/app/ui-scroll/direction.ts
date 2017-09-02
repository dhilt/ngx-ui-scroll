export default class Direction {
  static top: string = 'top';
  static bottom: string = 'bottom';

  static opposite(direction: string) {
    if (direction === Direction.top) {
      return Direction.bottom;
    }
    else if (direction === Direction.bottom) {
      return Direction.top;
    }
    else {
      return null;
    }
  }
}
