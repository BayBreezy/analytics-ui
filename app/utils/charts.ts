import type { ApexOptions } from "apexcharts";

/** The options every analytics chart starts from. Charts spread this and add their own. */
export function baseChartOptions(colors: string[]): ApexOptions {
  return {
    colors,
    chart: {
      toolbar: { show: false },
      parentHeightOffset: 0,
      background: "transparent",
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4, xaxis: { lines: { show: false } } },
    legend: { position: "top", horizontalAlign: "right", markers: { size: 6 } },
    tooltip: { shared: true, intersect: false },
    stroke: { curve: "smooth", width: 2.5 },
    states: { hover: { filter: { type: "lighten" } } },
  };
}

/** Whole-dollar axis labels like "$1.2K". */
export const axisCurrency = (value: number) => formatCompactCurrency(value);

/** Repeats a palette until there are `count` colors, so a chart with many slices never runs out. */
export function extendColors(colors: string[], count: number) {
  return Array.from(
    { length: Math.max(count, colors.length) },
    (_, index) => colors[index % colors.length]!
  );
}

/** "#3b82f6" with an alpha, as an `rgba()` string, so a color works on light and dark backgrounds. */
export function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
