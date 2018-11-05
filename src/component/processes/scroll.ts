import { Scroller } from '../scroller';
import { Process, ProcessStatus, ScrollPayload } from '../interfaces/index';
import { state } from '@angular/animations';

export default class Scroll {

  static run(scroller: Scroller, payload: ScrollPayload = {}) {
    scroller.logger.log(scroller.viewport.scrollPosition);
    if (scroller.state.syntheticScroll.position !== null) {
      if (!Scroll.processSyntheticScroll(scroller)) {
        return;
      }
    }
    this.delayScroll(scroller, payload);
  }

  static processSyntheticScroll(scroller: Scroller): boolean {
    const { viewport, state: { syntheticScroll }, settings, logger } = scroller;
    const time = Number(new Date());
    const synthetic = { ...syntheticScroll };
    const position = viewport.scrollPosition;
    const synthScrollDelay = time - synthetic.time;

    if (synthScrollDelay > settings.maxSynthScrollDelay) {
      logger.log(() => `reset synthetic scroll params (${synthScrollDelay} > ${settings.maxSynthScrollDelay})`);
      syntheticScroll.reset();
      return position !== synthetic.position;
    }

    // synthetic scroll
    syntheticScroll.readyToReset = true;
    if (position === synthetic.position) {
      // let's reset syntheticScroll.position on first change
      logger.log(() => `skip synthetic scroll (${position})`);
      return false;
    } else if (synthetic.readyToReset) {
      syntheticScroll.position = null;
      syntheticScroll.positionBefore = null;
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
      const inertiaDelta = <number>synthetic.positionBefore - position;
      const syntheticDelta = <number>synthetic.position - position;
      if (inertiaDelta > 0 && inertiaDelta < syntheticDelta) {
        const newPosition = Math.max(0, position + syntheticScroll.delta);
        logger.log(() => 'inertia scroll adjustment' +
          '. Position: ' + position +
          ', synthetic position: ' + synthetic.position +
          ', synthetic position before: ' + synthetic.positionBefore +
          ', synthetic delay: ' + synthScrollDelay +
          ', synthetic delta: ' + syntheticDelta +
          ', inertia delta: ' + inertiaDelta +
          ', new position: ' + newPosition);
        if (settings.inertia) { // precise inertia settings
          if (inertiaDelta <= settings.inertiaScrollDelta && synthScrollDelay <= settings.inertiaScrollDelay) {
            viewport.scrollPosition = newPosition;
          }
        } else {
          viewport.scrollPosition = newPosition;
        }
      } /* else {
        logger.log(() => 'inertia scroll adjustment [cancelled]' +
          '. Position: ' + position +
          ', synthetic position: ' + synthetic.position +
          ', synthetic position before: ' + synthetic.positionBefore +
          ', synthetic delta: ' + syntheticDelta + ', inertia delta: ' + inertiaDelta);
      } */
    }
    return true;
  }

  static delayScroll(scroller: Scroller, payload: ScrollPayload) {
    if (!scroller.settings.throttle || payload.byTimer) {
      Scroll.doScroll(scroller);
      return;
    }
    const { state: { scrollState } } = scroller;
    const time = Number(Date.now());
    const tDiff = scrollState.lastScrollTime + scroller.settings.throttle - time;
    const dDiff = scroller.settings.throttle + (scrollState.firstScrollTime ? scrollState.firstScrollTime - time : 0);
    const diff = Math.max(tDiff, dDiff);
    // scroller.logger.log('tDiff:', tDiff, 'dDiff:', dDiff, 'diff:', diff);
    if (diff <= 0) {
      scroller.purgeScrollTimers(true);
      scrollState.lastScrollTime = time;
      scrollState.firstScrollTime = 0;
      Scroll.doScroll(scroller);
    } else if (!scrollState.scrollTimer && !scrollState.keepScroll) {
      scroller.logger.log(() => [`%cset the timer at ${scroller.state.time + diff}`, 'background-color: #dfd']);
      scrollState.firstScrollTime = time;
      scrollState.scrollTimer = <any>setTimeout(() => {
        scrollState.scrollTimer = null;
        scroller.logger.log(() => [`%cfire the timer at ${scroller.state.time}`, 'background-color: #ffd']);
        Scroll.run(scroller, { byTimer: true });
      }, diff);
    } /* else {
      scroller.logger.log('MISS TIMER');
    } */
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
