import {
  Init,
  Scroll,
  Reset,
  Reload,
  Append,
  Check,
  Remove,
  UserClip,
  Insert,
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

import {
  Process,
  ProcessStatus as Status,
  StateMachineParams
} from './interfaces/index';

export const runStateMachine = ({
  input: { process, status, payload = {} },
  methods: { run, interrupt, done, onError }
}: StateMachineParams) => {
  if (status === Status.error) {
    onError(process, payload);
    if (!process.startsWith('adapter')) {
      run(End)(process, payload);
    }
    return;
  }
  switch (process) {
    case Process.init:
      if (status === Status.start) { // App start
        run(Init)();
      }
      if (status === Status.next) {
        run(Start)(process, payload);
      }
      break;
    case Process.scroll:
      if (status === Status.start) {
        run(Scroll)(process, payload);
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.reset:
    case Process.reload:
      const processToRun = process === Process.reset ? Reset : Reload;
      if (status === Status.start) { // Adapter reload/reset
        run(processToRun)(payload);
      }
      if (status === Status.next) {
        interrupt({ process, ...payload });
        if (payload.finalize) {
          run(End)(process);
        } else {
          run(Init)(process);
        }
      }
      break;
    case Process.append:
      if (status === Status.start) {
        run(Append)(process, payload);
      }
      if (status === Status.next) {
        run(Init)(process);
      }
      break;
    case Process.prepend:
      if (status === Status.start) {
        run(Append)(process, payload);
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
    case Process.insert:
      if (status === Status.start) {
        run(Insert)(payload);
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
        switch (payload.process) {
          case Process.append:
          case Process.prepend:
          case Process.check:
          case Process.insert:
            run(Render)();
            break;
          case Process.remove:
            run(Clip)();
            break;
          case Process.userClip:
            run(PreFetch)(payload.process);
            break;
          default:
            run(PreFetch)();
        }
      }
      break;
    case Process.preFetch:
      switch (payload.process) {
        case Process.userClip:
          run(PreClip)();
          break;
        default:
          if (status === Status.next) {
            run(Fetch)();
          }
          if (status === Status.done) {
            run(End)(process);
          }
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
      if (status === Status.done) {
        run(End)(process);
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
        if (payload.process === Process.end) {
          run(End)(process);
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
        switch (payload.process) {
          case Process.reset:
          case Process.reload:
            done();
            run(Init)(payload.process);
            break;
          default:
            run(Start)(process);
        }
      } else if (status === Status.done) {
        done();
      }
      break;
  }
};
