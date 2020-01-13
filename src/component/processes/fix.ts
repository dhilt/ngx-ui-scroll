import { Scroller } from '../scroller';
import { Direction, ItemsPredicate, Process, ProcessStatus, FixOptions } from '../interfaces/index';

interface IFix {
  scrollPosition: (value: number) => void;
  minIndex: (value: number) => void;
  maxIndex: (value: number) => void;
}

enum FixParamToken {
  scrollPosition = 'scrollPosition',
  minIndex = 'minIndex',
  maxIndex = 'maxIndex'
}

enum FixParamType {
  integer = 'integer'
}

interface FixParam {
  token: FixParamToken;
  type: FixParamType;
  call: Function;
  value?: any;
}

export default class Fix {

  static params: FixParam[] = [
    {
      token: FixParamToken.scrollPosition,
      type: FixParamType.integer,
      call: Fix.setScrollPosition
    },
    {
      token: FixParamToken.minIndex,
      type: FixParamType.integer,
      call: Fix.setMinIndex
    },
    {
      token: FixParamToken.maxIndex,
      type: FixParamType.integer,
      call: Fix.setMaxIndex
    }
  ];

  static run(scroller: Scroller, options: FixOptions) {
    const params = Fix.checkOptions(scroller, options);

    if (!params.length) {
      scroller.callWorkflow({
        process: Process.fix,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.fix" method call` }
      });
      return;
    }

    params.forEach((param: FixParam) => {
      param.call(scroller, param.value);
    });

    scroller.callWorkflow({
      process: Process.fix,
      status: ProcessStatus.done
    });
  }

  static setScrollPosition(scroller: Scroller, value: number) {
    const { state, viewport } = scroller;
    state.syntheticScroll.reset();
    viewport.setPosition(value);
  }

  static setMinIndex(scroller: Scroller, value: number) {
    const { buffer, settings } = scroller;
    settings.minIndex = value;
    buffer.absMinIndex = value;
  }

  static setMaxIndex(scroller: Scroller, value: number) {
    const { buffer, settings } = scroller;
    settings.maxIndex = value;
    buffer.absMaxIndex = value;
  }

  static checkOptions(scroller: Scroller, options: FixOptions): FixParam[] {
    if (!options || typeof options !== 'object') {
      return [];
    }
    return Fix.params.reduce((acc: FixParam[], param: FixParam) => {
      const { token, type } = param;
      if (options.hasOwnProperty(token)) {
        let value = (<any>options)[token];
        let parsedValue = value;
        let warning = '';
        if (type === FixParamType.integer) {
          value = Number(value);
          parsedValue = parseInt(value, 10);
          if (value !== parsedValue) {
            warning = 'it must be an integer';
          }
        }
        if (!warning) {
          return [...acc, { ...param, value }];
        }
        scroller.logger.log(() => `can't set ${token}, ${warning}`);
      }
      return acc;
    }, []);
  }

}
