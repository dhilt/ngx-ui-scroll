import { Misc } from 'miscellaneous/misc';
import { makeTest } from '../scaffolding/runner';

const checkCanNotScroll = async (misc: Misc, value: number) => {
  const scrollElt = misc.getScrollableElement();
  scrollElt.scrollTop = value;
  await misc.delay(50);
  expect(misc.adapter.isLoading).toBe(false);
};

const checkCanNotCallAdapter = async (misc: Misc, method: string) => {
  const result = await misc.adapter[method]();
  expect(result.success).toBe(true);
  expect(result.immediate).toBe(true);
  expect(result.details).toBe('Scroller is paused');
  await misc.delay(50);
  expect(misc.adapter.isLoading).toBe(false);
};

describe('Adapter Pause/Resume Spec', () => {
  makeTest({
    title: 'should pause & resume',
    config: { datasourceSettings: { adapter: true } },
    it: misc => async done => {
      let paused;
      const { adapter, workflow } = misc;
      adapter.paused$.subscribe(v => (paused = v));

      await misc.relaxNext();
      expect(workflow.cyclesDone).toBe(1);
      const lastVisibleIndexInit = adapter.lastVisible.$index;
      const minIndexInit = adapter.bufferInfo.maxIndex;
      expect(adapter.paused).toBe(false);
      expect(paused).toBeFalsy();

      // pause should work immediately
      const pauseResult = await adapter.pause();
      expect(pauseResult.success).toBe(true);
      expect(pauseResult.immediate).toBe(true);
      expect(paused).toBe(true);
      expect(adapter.paused).toBe(true);

      // relax does nothing but resolve immediately
      const relaxResult = await adapter.relax();
      expect(relaxResult.success).toBe(true);
      expect(relaxResult.immediate).toBe(true);

      // scroll & adapter methods don't work (except resume and reset)
      await checkCanNotScroll(misc, 0);
      await checkCanNotScroll(misc, 9999);
      await checkCanNotCallAdapter(misc, 'reload');
      await checkCanNotCallAdapter(misc, 'clip');
      await checkCanNotCallAdapter(misc, 'fix');
      await checkCanNotCallAdapter(misc, 'pause');

      expect(workflow.cyclesDone).toBe(1);
      expect(adapter.lastVisible.$index).toBe(lastVisibleIndexInit);
      expect(adapter.bufferInfo.maxIndex).toBe(minIndexInit);

      // resume runs the workflow
      const resumeResult = await adapter.resume();
      expect(resumeResult.success).toBe(true);
      expect(resumeResult.immediate).toBe(false);
      expect(paused).toBe(false);
      expect(adapter.paused).toBe(false);

      expect(workflow.cyclesDone).toBe(2);
      expect(adapter.lastVisible.$index).toBe(minIndexInit);
      expect(adapter.bufferInfo.maxIndex).toBeGreaterThan(minIndexInit);

      // scroll & adapter methods start working after resume
      await misc.scrollMaxRelax();
      expect(workflow.cyclesDone).toBe(3);
      await adapter.reload();
      expect(workflow.cyclesDone).toBe(4);

      done();
    }
  });

  makeTest({
    title: 'should allow only "reset" when paused',
    config: { datasourceSettings: { adapter: true } },
    it: misc => async done => {
      await misc.relaxNext();
      expect(misc.workflow.cyclesDone).toBe(1);
      expect(misc.adapter.paused).toBe(false);
      await misc.adapter.pause();
      await checkCanNotCallAdapter(misc, 'reload');
      expect(misc.workflow.cyclesDone).toBe(1);
      expect(misc.adapter.paused).toBe(true);
      await misc.adapter.reset();
      expect(misc.workflow.cyclesDone).toBe(2);
      expect(misc.adapter.paused).toBe(false);
      // scroll & adapter work as usual after reset
      await misc.scrollMaxRelax();
      expect(misc.workflow.cyclesDone).toBe(3);
      await misc.adapter.reload();
      expect(misc.workflow.cyclesDone).toBe(4);
      done();
    }
  });
});
