import { Direction } from '../interfaces/direction';
import { Viewport } from '../classes/viewport';

export const calculateFlowDirection = (viewport: Viewport): Direction => {
  const scrollPosition = viewport.scrollPosition;
  const viewportSize = viewport.scrollable.scrollHeight;
  const backwardPadding = viewport.padding[Direction.backward].size;
  if (scrollPosition < backwardPadding) {
    return Direction.backward;
  }
  if (scrollPosition <= viewportSize - backwardPadding) {
    const lastScrollPosition = viewport.getLastPosition();
    if (lastScrollPosition < scrollPosition) {
      return Direction.forward;
    } else if (lastScrollPosition > scrollPosition) {
      return Direction.backward;
    }
  }
  return Direction.forward;
};
