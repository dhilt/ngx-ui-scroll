import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Scroll {

  static run(scroller: Scroller) {
    if (scroller.state.syntheticScroll.position !== null) {
      if (!Scroll.processSyntheticScroll(scroller)) {
        return;
      }
    }
    this.throttledScroll(scroller);
  }

  static purgeTimer(scroller: Scroller) {
    const { state: { scrollState } } = scroller;
    if (scrollState.scrollTimer) {
      clearTimeout(scrollState.scrollTimer);
      scrollState.scrollTimer = null;
    }
  }

  static processSyntheticScroll(scroller: Scroller): boolean {
    const { viewport, state: { syntheticScroll}, settings, logger } = scroller;
    const position = viewport.scrollPosition;
    const syntheticPosition = <number>syntheticScroll.position;
    const syntheticPositionBefore = <number>syntheticScroll.positionBefore;

    // synthetic scroll
    if (position === syntheticPosition) {
      // let's reset syntheticScroll.position on first change
      syntheticScroll.readyToReset = true;
      logger.log(() => `skip synthetic scroll (${position})`);
      return false;
    } else if (syntheticScroll.readyToReset) {
      syntheticScroll.position = null;
      syntheticScroll.positionBefore = null;
      logger.log(() => 'reset synthetic scroll params');
    }

    // inertia scroll over synthetic scroll
    if (position !== syntheticPosition) {
      console.log('SYNTHETIC UNEQUAL');
      const inertiaDelay = Number(new Date()) - syntheticScroll.time;
      const inertiaDelta = syntheticPositionBefore - position;
      const syntheticDelta = syntheticPosition - position;
      const newPosition = Math.max(0, position + syntheticScroll.delta);
      if (inertiaDelta > 0 && inertiaDelta < syntheticDelta) {
        logger.log(() => 'inertia scroll adjustment' +
          '. Position: ' + position +
          ', synthetic position: ' + syntheticPosition +
          ', synthetic position before: ' + syntheticPositionBefore +
          ', synthetic delta: ' + syntheticDelta +
          ', inertia delay: ' + inertiaDelay + ', inertia delta: ' + inertiaDelta);
        if (settings.inertia) { // precise inertia settings
          if (inertiaDelta <= settings.inertiaScrollDelta && inertiaDelay <= settings.inertiaScrollDelay) {
            viewport.scrollPosition = newPosition;
          }
        } else {
          viewport.scrollPosition = newPosition;
        }
      }
    }
    return true;
  }

  static throttledScroll(scroller: Scroller) {
    const { state: { scrollState } } = scroller;
    if (!scroller.settings.throttle) {
      Scroll.doScroll(scroller);
      return;
    }
    const diff = scrollState.lastScrollTime + scroller.settings.throttle - Date.now();
    if (diff < 0) {
      Scroll.purgeTimer(scroller);
      scrollState.lastScrollTime = Date.now();
      Scroll.doScroll(scroller);
    } else if (!scrollState.scrollTimer) {
      scrollState.scrollTimer = <any>setTimeout(() => {
        Scroll.run(scroller);
        scrollState.scrollTimer = null;
      }, diff);
    }
  }

  static doScroll(scroller: Scroller) {
    const { state } = scroller;
    if (state.pending) {
      scroller.logger.log(() =>
        !state.scrollState.keepScroll ? `setting keepScroll flag (scrolling while the Workflow is pending)` : '');
      state.scrollState.keepScroll = true;
      return;
    }
    Scroll.purgeTimer(scroller);
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.scroll,
      status: ProcessStatus.next,
      payload: {
        scroll: true,
        direction: scroller.getScrollDirection(),
        keepScroll: state.scrollState.keepScroll
      }
    });
  }

}
