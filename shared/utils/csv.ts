export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/**
 * A cell that starts with one of these is run as a formula by spreadsheet programs, so a name like
 * `=HYPERLINK(...)` could do something nasty when the file is opened.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

/** One cell as CSV text: formulas are defused and anything with a comma, quote or newline quoted. */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  // Numbers are written as they are, so a negative number stays a number.
  let text = typeof value === "number" ? String(value) : value;
  if (typeof value === "string" && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Rows as CSV text with a header row, CRLF line ends and a BOM so Excel reads UTF-8 properly. */
export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const lines = [
    columns.map((column) => csvCell(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}
