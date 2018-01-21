let timer = null;
let next = null;

const runTimer = (delay) => {
  timer = setTimeout(() => {
    timer = null;
    if (next) {
      next();
      next = null;
      runTimer(delay);
    }
  }, delay);
};

export const debouncedRound = (cb, delay) => {
  if (!timer) {
    cb();
  } else {
    next = cb;
    clearTimeout(timer);
  }
  runTimer(delay);
};
