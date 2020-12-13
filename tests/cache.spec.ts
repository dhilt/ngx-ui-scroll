import { generateItems } from './miscellaneous/items';
import { Item } from '../src/component/classes/item';
import { Cache } from '../src/component/classes/cache';

describe('Cache Spec', () => {

  describe('Remove', () => {
    const loggerMock = { log: () => null };
    const routinesMock = {};
    const MIN = 1, COUNT = 5;
    const items = generateItems(COUNT, MIN - 1).map((item, index) =>
      new Item(index + MIN, item, routinesMock as any)
    );

    let cache: Cache;

    const check = (idList: (number | null)[]) =>
      idList.forEach((id, index) => {
        const item = cache.get(index + MIN);
        const idCached = item && item.data ? item.data.id : null;
        expect(idCached).toEqual(id);
      });

    beforeEach(() => {
      cache = new Cache(NaN, true, loggerMock as any);
      items.forEach(item => cache.add(item));
    });

    it('should not remove when out of the right border & immutableTop = true', (done) => {
      cache.removeItems([99], true);
      check([1, 2, 3, 4, 5]);
      done();
    });

    it('should increase all indexes when out of the right border & immutableTop = false', (done) => {
      cache.removeItems([99], false);
      check([null, 1, 2, 3, 4, 5]);
      done();
    });

    it('should not remove when out of the left border & immutableTop = false', (done) => {
      cache.removeItems([-99], false);
      check([1, 2, 3, 4, 5]);
      done();
    });

    it('should decrease all indexes when out of the left border & immutableTop = true', (done) => {
      cache.removeItems([-99], true);
      check([2, 3, 4, 5]);
      done();
    });

    it('should decrease bottom indexes when removing from top & immutableTop = true', (done) => {
      cache.removeItems([1, 2], true);
      check([3, 4, 5, null, null]);
      done();
    });

    it('should not shift indexes when removing from top & immutableTop = false', (done) => {
      cache.removeItems([1, 2], false);
      check([null, null, 3, 4, 5]);
      done();
    });

    it('should not shift indexes when removing from bottom & immutableTop = true', (done) => {
      cache.removeItems([4, 5], true);
      check([1, 2, 3, null, null]);
      done();
    });

    it('should increase top indexes when removing from bottom & immutableTop = false', (done) => {
      cache.removeItems([4, 5], false);
      check([null, null, 1, 2, 3]);
      done();
    });

    it('should decrease the below indexes when removing from center & immutableTop = true', (done) => {
      cache.removeItems([3], true);
      check([1, 2, 4, 5, null]);
      done();
    });

    it('should shift increase the above indexes when removing from center & immutableTop = false', (done) => {
      cache.removeItems([3], false);
      check([null, 1, 2, 4, 5]);
      done();
    });

    it('should remove non-sequenced list', (done) => {
      cache.removeItems([1, 3, 5], true);
      check([2, 4, null, null, null]);
      done();
    });
  });

});
