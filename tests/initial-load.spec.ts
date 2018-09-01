import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const configList = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2 },
  templateSettings: { viewportHeight: 20 },
  expected: {
    workflow: {
      cyclesDone: 1
    },
    padding: {
      [Direction.backward]: {
        size: 0
      },
      [Direction.forward]: {
        size: 0
      },
    },
    scroller: {
      state: {
        fetch: {
          callCount: 1
        },
        cycleCount: 2
      },
      buffer: {
        items: {
          length: 5
        }
      }
    },
    firstElement: {
      text: `${1} : item #${1}`,
    }
  }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5 },
  templateSettings: { viewportHeight: 120 },
  expected: {
    workflow: {
      cyclesDone: 1
    },
    padding: {
      [Direction.backward]: {
        size: 0
      },
      [Direction.forward]: {
        size: 0
      },
    },
    scroller: {
      state: {
        fetch: {
          callCount: 1
        },
        cycleCount: 2
      },
      buffer: {
        items: {
          length: 12
        }
      }
    },
    firstElement: {
      text: `${1} : item #${1}`,
    }
  }
}, {
  datasourceSettings: { startIndex: -99, bufferSize: 5, padding: 0.5 },
  templateSettings: { viewportHeight: 200 },
  expected: {
    workflow: {
      cyclesDone: 1
    },
    padding: {
      [Direction.backward]: {
        size: 0
      },
      [Direction.forward]: {
        size: 0
      },
    },
    scroller: {
      state: {
        fetch: {
          callCount: 1
        },
        cycleCount: 2
      },
      buffer: {
        items: {
          length: 20
        }
      }
    },
    firstElement: {
      text: null,
    }
  }
}, {
  datasourceSettings: { startIndex: -77, bufferSize: 4, padding: 0.62, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  expected: {
    workflow: {
      cyclesDone: 1
    },
    padding: {
      [Direction.backward]: {
        size: 0
      },
      [Direction.forward]: {
        size: 0
      },
    },
    scroller: {
      state: {
        fetch: {
          callCount: 1
        },
        cycleCount: 2
      },
      buffer: {
        items: {
          length: 51
        }
      }
    },
    firstElement: {
      text: null,
    }
  }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 0.5, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0 },
  expected: {
    workflow: {
      cyclesDone: 1
    },
    padding: {
      [Direction.backward]: {
        size: 0
      },
      [Direction.forward]: {
        size: 0
      },
    },
    scroller: {
      state: {
        fetch: {
          callCount: 1
        },
        cycleCount: 2
      },
      buffer: {
        items: {
          length: 76
        }
      }
    },
    firstElement: {
      text: `${1} : item #${1}`,
    }
  }
}];

const _shouldNotClip = (settings: TestBedConfig, misc: Misc, done: Function) => {
  expect(misc.workflow.cyclesDone).toEqual(settings.expected.workflow.cyclesDone);
  expect(misc.scroller.state.fetch.callCount).toEqual(settings.expected.scroller.state.fetch.callCount);
  expect(misc.scroller.state.cycleCount).toEqual(settings.expected.scroller.state.cycleCount);
  expect(misc.scroller.buffer.items.length).toEqual(settings.expected.scroller.buffer.items.length);
  expect(misc.padding[Direction.backward].getSize()).toEqual(settings.expected.padding[Direction.backward].size);
  expect(misc.padding[Direction.forward].getSize()).toEqual(settings.expected.padding[Direction.forward].size);
  expect(misc.getElementText(1)).toEqual(settings.expected.firstElement.text);
  // todo: add last, next after last and previous before first items check

  done();
};

const shouldNotClip = (settings: TestBedConfig) => (misc: Misc) => (done: Function) =>
  spyOn(misc.workflow, 'finalize').and.callFake(() =>
    _shouldNotClip(settings, misc, done)
  );

describe('Initial Load Spec', () => {
  describe('No Clip', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with no clip',
        it: shouldNotClip(config)
      })
    );
  });
});
