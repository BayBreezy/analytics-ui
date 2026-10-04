const SEQUENCE_TIMEOUT_MS = 1200;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);

/**
 * Keyboard shortcuts for the whole app: `G` then a letter goes to a page and `?` opens the list of
 * shortcuts. They are ignored while typing, with a modifier key held or when a dialog is open.
 */
export function useGlobalShortcuts() {
  let waitingForSecondKey = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stopWaiting = () => {
    waitingForSecondKey = false;
    clearTimeout(timer);
  };

  useEventListener("keydown", (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTyping(event.target) || document.querySelector('[role="dialog"], [role="alertdialog"]'))
      return;

    if (event.key === "?") {
      stopWaiting();
      navigateTo({ path: "/help", query: { tab: "shortcuts" } });
      return;
    }

    const key = event.key.toLowerCase();
    if (waitingForSecondKey) {
      stopWaiting();
      const path = GO_TO_SHORTCUTS[key];
      if (path) {
        event.preventDefault();
        navigateTo(path);
      }
    } else if (key === "g" && !event.shiftKey) {
      waitingForSecondKey = true;
      timer = setTimeout(stopWaiting, SEQUENCE_TIMEOUT_MS);
    }
  });
}
