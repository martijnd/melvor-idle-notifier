/**
 * Creates a window focus tracker. document.hidden only covers tab switches,
 * not when the user clicks another app — this tracks both.
 * @returns {() => boolean} Getter that returns true when the window has focus
 */
export function createWindowFocusTracker() {
  let windowFocused = document.hasFocus();

  window.addEventListener("focus", () => {
    windowFocused = true;
  });
  window.addEventListener("blur", () => {
    windowFocused = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      windowFocused = false;
    } else {
      windowFocused = document.hasFocus();
    }
  });

  return () => windowFocused;
}
