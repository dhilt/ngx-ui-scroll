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
    if (scroller.settings.windowViewport) {
      if (!Scroll.processWindowScroll(scroller)) {
        return;
      }
    }
    this.throttledScroll(scroller);
  }

  static processWindowScroll(scroller: Scroller): boolean {
    const { state: { scrollState: { window: windowState } }, viewport } = scroller;
    if (windowState.delta) {
      if (windowState.positionToUpdate === viewport.scrollPosition) {
        scroller.logger.log(() => `process window scroll: sum(${windowState.positionToUpdate}, ${windowState.delta})`);
        viewport.scrollPosition += windowState.delta;
        windowState.reset();
        return false;
      }
    }
    return true;
  }

  static processSyntheticScroll(scroller: Scroller): boolean {
    const { viewport, state: { syntheticScroll }, settings, logger } = scroller;
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
    } else if (settings.windowViewport) { // && !syntheticScroll.readyToReset
      logger.log(() => 'reset synthetic scroll params (window)');
      syntheticScroll.reset();
      return true;
    }

    // inertia scroll over synthetic scroll
    if (position !== syntheticPosition) {
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
        ] : '');
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
