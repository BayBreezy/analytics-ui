import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "../../shared/utils/csv";

describe("csvCell", () => {
  it("leaves plain text and numbers alone", () => {
    expect(csvCell("hello")).toBe("hello");
    expect(csvCell(12.5)).toBe("12.5");
    expect(csvCell(0)).toBe("0");
  });

  it("writes nothing for null and undefined", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("quotes text with a comma, a quote or a line break", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("one\ntwo")).toBe('"one\ntwo"');
    expect(csvCell("one\r\ntwo")).toBe('"one\r\ntwo"');
  });

  it.each(["=SUM(A1)", "+1", "-2+3", "@cmd", "\tx", "\rx"])(
    "defuses a formula start: %j",
    (text) => {
      expect(csvCell(text).replace(/^"/, "").startsWith("'")).toBe(true);
    }
  );

  it("defuses and quotes at the same time", () => {
    expect(csvCell('=HYPERLINK("x","y")')).toBe(`"'=HYPERLINK(""x"",""y"")"`);
  });

  it("keeps a negative number a number", () => {
    expect(csvCell(-5)).toBe("-5");
    expect(csvCell("-5")).toBe("'-5");
  });

  it("leaves a dash in the middle of text alone", () => {
    expect(csvCell("a-b")).toBe("a-b");
    expect(csvCell("ORD-4821")).toBe("ORD-4821");
  });
});

describe("toCsv", () => {
  const columns = [
    { header: "Name", value: (row: { name: string; qty?: number }) => row.name },
    { header: "Qty", value: (row: { name: string; qty?: number }) => row.qty },
  ];

  it("starts with a BOM and a header row, and ends each line with CRLF", () => {
    const csv = toCsv(columns, [{ name: "Lamp", qty: 3 }]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe("﻿Name,Qty\r\nLamp,3\r\n");
  });

  it("writes one line per row with empty cells for missing values", () => {
    const csv = toCsv(columns, [{ name: "A" }, { name: "B, Inc.", qty: 2 }]);
    expect(csv.split("\r\n")).toEqual(["﻿Name,Qty", "A,", '"B, Inc.",2', ""]);
  });

  it("writes only the header when there are no rows", () => {
    expect(toCsv(columns, [])).toBe("﻿Name,Qty\r\n");
  });

  it("quotes headers too", () => {
    expect(toCsv([{ header: "Total, USD", value: () => 1 }], [{}])).toContain('"Total, USD"');
  });
});
