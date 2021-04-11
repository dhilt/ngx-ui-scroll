export function debounce(func: (...args: unknown[]) => unknown, wait: number, immediate?: boolean): () => void {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function (...args: unknown[]) {
    const context = args[0];
    const later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}
