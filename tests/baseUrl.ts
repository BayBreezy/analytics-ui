/** Where the tests send requests: a server you started yourself, or the one Playwright builds. */
export const PORT = 3222;
export const BASE_URL = process.env.PW_BASE_URL ?? `http://localhost:${PORT}`;
