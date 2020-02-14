import {
  Init,
  Scroll,
  Reload,
  Append,
  Check,
  Remove,
  UserClip,
  Fix,
  Start,
  PreFetch,
  Fetch,
  PostFetch,
  Render,
  PreClip,
  Clip,
  Adjust,
  End
} from './processes/index';

import { Process, ProcessStatus as Status, ProcessSubject } from './interfaces/index';

interface StateMachineParams {
  input: ProcessSubject;
  methods: {
    run: Function;
    interrupt: Function;
    done: Function;
    onError: Function;
  };
  options: any;
}

export const runStateMachine = ({
  options,
  input: { process, status, payload = {} },
  methods: { run, interrupt, done, onError }
}: StateMachineParams) => {
  if (status === Status.error) {
    onError(process, payload);
    run(End)(process, payload);
    return;
  }
  switch (process) {
    case Process.init:
      if (status === Status.start) {
        run(Init)();
      }
      if (status === Status.next) {
        run(Start)(payload);
      }
      break;
    case Process.scroll:
      if (status === Status.start) {
        run(Scroll)(payload);
      }
      if (status === Status.next) {
        if (!options.keepScroll) {
          run(Init)(process);
        } else {
          run(Start)(process);
        }
      }
      break;
    case Process.reload:
      if (status === Status.start) {
        run(Reload)(payload);
      }
      if (status === Status.next) {
        interrupt(process);
        if (payload.finalize) {
          run(End)(process);
        } else {
          run(Init)(process);
        }
      }
      break;
    case Process.append:
      if (status === Status.start) {
        run(Append)(payload);
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.prepend:
      if (status === Status.start) {
        run(Append)({ ...payload, prepend: true });
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.check:
      if (status === Status.start) {
        run(Check)();
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.remove:
      if (status === Status.start) {
        run(Remove)(payload);
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.userClip:
      if (status === Status.start) {
        run(UserClip)(payload);
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.fix:
      if (status === Status.start) {
        run(Fix)(payload);
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.start:
      if (status === Status.next) {
        switch (payload) {
          case Process.append:
          case Process.prepend:
          case Process.check:
            run(Render)();
            break;
          case Process.remove:
            run(Clip)();
            break;
          case Process.userClip:
            run(PreFetch)(payload);
            break;
          default:
            if (options.noFetch) {
              run(End)(process);
            } else {
              run(PreFetch)();
            }
        }
      }
      break;
    case Process.preFetch:
      const userClip = payload === Process.userClip;
      if (status === Status.done && !userClip) {
        run(End)(process);
      }
      if (status === Status.next && !userClip) {
        run(Fetch)();
      }
      if (userClip) {
        run(PreClip)();
      }
      break;
    case Process.fetch:
      if (status === Status.next) {
        run(PostFetch)();
      }
      break;
    case Process.postFetch:
      if (status === Status.next) {
        run(Render)();
      }
      if (status === Status.done) {
        run(End)(process);
      }
      break;
    case Process.render:
      if (status === Status.next) {
        if (payload.noClip) {
          run(Adjust)();
        } else {
          run(PreClip)();
        }
      }
      break;
    case Process.preClip:
      if (status === Status.next) {
        if (payload.doClip) {
          run(Clip)();
        } else {
          run(Adjust)();
        }
      }
      break;
    case Process.clip:
      if (status === Status.next) {
        if (payload === Process.end) {
          run(End)();
        } else {
          run(Adjust)();
        }
      }
      break;
    case Process.adjust:
      if (status === Status.done) {
        run(End)(process);
      }
      break;
    case Process.end:
      if (status === Status.next) {
        switch (payload) {
          case Process.reload:
            done();
            run(Init)(payload);
            break;
          default:
            if (options.keepScroll) {
              run(Scroll)();
            } else {
              run(Start)(process);
            }
        }
      } else if (status === Status.done) {
        done();
      }
      break;
  }
};
