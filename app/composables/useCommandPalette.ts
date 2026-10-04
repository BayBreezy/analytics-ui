/** Whether the command palette is open. Shared by the header button, the shortcuts and the palette. */
export const useCommandPalette = () => useState("command-palette", () => false);
