const SEQUENCE_TIMEOUT_MS = 1200;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);

/**
 * Keyboard shortcuts for the whole app: `Ctrl/Cmd+K` (or `/`) opens the command palette, `G` then a
 * letter goes to a page and `?` opens the list of shortcuts. Apart from `Ctrl/Cmd+K`, they are
 * ignored while typing, with a modifier key held or when a dialog is open.
 */
export function useGlobalShortcuts() {
  const paletteOpen = useCommandPalette();

  let waitingForSecondKey = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stopWaiting = () => {
    waitingForSecondKey = false;
    clearTimeout(timer);
  };

  useEventListener("keydown", (event: KeyboardEvent) => {
    // Works everywhere, even in a field, and closes the palette again.
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      paletteOpen.value = !paletteOpen.value;
      return;
    }
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTyping(event.target) || document.querySelector('[role="dialog"], [role="alertdialog"]'))
      return;

    if (event.key === "/") {
      event.preventDefault();
      paletteOpen.value = true;
      return;
    }

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
