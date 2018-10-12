import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Scroll {

  static run(scroller: Scroller) {
    scroller.logger.log(scroller.viewport.scrollPosition);
    if (scroller.state.syntheticScroll.position !== null) {
      if (!Scroll.processSyntheticScroll(scroller)) {
        return;
      }
    }
    this.throttledScroll(scroller);
  }

  static processSyntheticScroll(scroller: Scroller): boolean {
    const { viewport, state: { syntheticScroll }, settings, logger } = scroller;
    const position = viewport.scrollPosition;
    const synthetic = { ...syntheticScroll };

    // synthetic scroll
    syntheticScroll.readyToReset = true;
    if (position === synthetic.position) {
      // let's reset syntheticScroll.position on first change
      logger.log(() => `skip synthetic scroll (${position})`);
      return false;
    } else if (synthetic.readyToReset) {
      syntheticScroll.reset();
      logger.log(() => 'reset synthetic scroll params');
    }
    if (settings.windowViewport) {
      if (!synthetic.readyToReset) {
        logger.log(() => 'reset synthetic scroll params (window)');
        syntheticScroll.reset();
      }
      return true;
    }

    // inertia scroll over synthetic scroll
    if (position !== synthetic.position) {
      const inertiaDelay = Number(new Date()) - syntheticScroll.time;
      const inertiaDelta = <number>synthetic.positionBefore - position;
      const syntheticDelta = <number>synthetic.position - position;
      const newPosition = Math.max(0, position + syntheticScroll.delta);
      if (inertiaDelta > 0 && inertiaDelta < syntheticDelta) {
        logger.log(() => 'inertia scroll adjustment' +
          '. Position: ' + position +
          ', synthetic position: ' + synthetic.position +
          ', synthetic position before: ' + synthetic.positionBefore +
          ', synthetic delta: ' + syntheticDelta +
          ', inertia delay: ' + inertiaDelay + ', inertia delta: ' + inertiaDelta +
          ', new position: ' + newPosition);
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
    if (!scroller.settings.throttle) {
      Scroll.doScroll(scroller);
      return;
    }
    const { state: { scrollState } } = scroller;
    const diff = scrollState.lastScrollTime + scroller.settings.throttle - Date.now();
    if (diff <= 0) {
      scroller.purgeScrollTimers(true);
      scrollState.lastScrollTime = Date.now();
      Scroll.doScroll(scroller);
    } else if (!scrollState.scrollTimer) {
      // scroller.logger.log('%cset timer', 'background-color: green;');
      scrollState.scrollTimer = <any>setTimeout(() => {
        scrollState.scrollTimer = null;
        // scroller.logger.log('%cfire the timer', 'background-color: green;');
        Scroll.run(scroller);
      }, diff);
    }
  }

  static doScroll(scroller: Scroller) {
    const { state, state: { scrollState } } = scroller;
    if (state.workflowPending) {
      scroller.logger.log(() =>
        !scrollState.keepScroll ? [
          `setting %ckeepScroll%c flag (scrolling while the Workflow is pending)`,
          'color: #006600;', 'color: #000000;'
        ] : undefined);
      scrollState.keepScroll = true;
      return;
    }
    scroller.callWorkflow({
      process: Process.scroll,
      status: ProcessStatus.next,
      payload: {
        scroll: true,
        ...(scrollState.keepScroll ? { keepScroll: scrollState.keepScroll } : {})
      }
    });
  }

}
