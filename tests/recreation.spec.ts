import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { Misc } from './miscellaneous/misc';

import {
  configureTestBedSub,
  configureTestBedPlain
} from './scaffolding/testBed';
import {
  ScrollerSubTestComponent,
  ScrollerPlainTestComponent
} from './scaffolding/testComponent';

describe('Recreation Spec', () => {
  describe('Destroying (plain DS)', () => {
    let misc: Misc<ScrollerPlainTestComponent>;

    beforeEach(() => {
      misc = new Misc(configureTestBedPlain());
    });

    it('should not reset Datasource on destroy', async () => {
      misc.fixture.destroy();
      await misc.delay(25);
    });

    it('should not reset Datasource on destroy via ngIf', async () => {
      await misc.delay(25);
      misc.testComponent.show = false;
      await misc.delay(25);
    });
  });

  describe('Recreation via ngIf (instance DS)', () => {
    let misc: Misc<ScrollerSubTestComponent>;
    let scrollerId: number;
    let adapterId: number;

    beforeEach(() => {
      misc = new Misc(configureTestBedSub());
      scrollerId = misc.scroller.settings.instanceIndex;
      adapterId = misc.adapter.id;
    });

    const init = (flag: boolean): Promise<boolean> =>
      firstValueFrom(
        misc.testComponent.datasource.adapter.init$.pipe(
          filter(v => (flag ? v : !v)),
          take(1)
        )
      );

    const ngIfReload = async (onBeforeHide?: () => void): Promise<void> => {
      await init(true);
      await misc.adapter.relax();
      onBeforeHide && onBeforeHide();
      misc.testComponent.show = false;
      await init(false);
      misc.testComponent.show = true;
      misc.fixture.changeDetectorRef.detectChanges();
      await init(true);
    };

    it('should switch Adapter.init trice', async () => {
      let count = 0;
      const result = new Promise(resolve => {
        const sub = misc.testComponent.datasource.adapter.init$.subscribe(
          () => {
            if (++count === 3) {
              sub.unsubscribe();
              resolve(null);
            }
          }
        );
      });
      await ngIfReload();
      await result;
      expect(count).toBe(3);
    });

    it('should re-render the viewport', async () => {
      expect(misc.workflow.isInitialized).toEqual(false);
      expect(misc.adapter.id).toEqual(adapterId);
      const _scroller = misc.scroller;
      expect(_scroller.settings.instanceIndex).toEqual(scrollerId);
      await ngIfReload();
      const wf = misc.getWorkflow();
      const scroller = wf.scroller;
      expect(_scroller).not.toEqual(scroller);
      expect(wf.isInitialized).toEqual(true);
      expect(misc.adapter.id).toEqual(adapterId);
      expect(scroller.adapter.id).toEqual(adapterId);
      expect(scroller.settings.instanceIndex).toEqual(scrollerId + 1);
    });

    it('should scroll and take firstVisible', async () => {
      await ngIfReload();
      await misc.adapter.relax();
      const { firstVisible, firstVisible$ } = misc.adapter;
      expect(firstVisible.$index).toEqual(1);
      await misc.scrollMaxRelax();
      expect(misc.adapter.firstVisible$).toEqual(firstVisible$);
      expect(misc.adapter.firstVisible.$index).toBeGreaterThan(1);
    });

    it('should clear Buffer', async () => {
      let retainedBuffer, retainedItem;
      await ngIfReload(() => {
        retainedBuffer = misc.scroller.buffer;
        retainedItem = retainedBuffer.items[0];
        expect(retainedBuffer.size).not.toBe(0);
        expect(retainedItem.element).toBeTruthy();
      });
      await misc.adapter.relax();
      const buffer = misc.getWorkflow().scroller.buffer;
      expect((retainedBuffer as unknown as { size: number }).size).toBe(0);
      expect(
        (retainedItem as unknown as { element?: HTMLElement }).element
      ).toBeFalsy();
      expect(buffer.size).not.toBe(0);
      expect(buffer.items[0].element).toBeTruthy();
    });
  });
});
