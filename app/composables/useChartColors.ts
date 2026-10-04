import { formatHex } from "culori";

const FALLBACK = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#f43f5e"];

/**
 * The theme's chart colors (`--chart-1` to `--chart-5`) as hex strings. ApexCharts needs real color
 * values for series and gradients, so the oklch CSS variables are read and converted. They are read
 * again when the color mode changes, so charts follow light and dark mode.
 */
export function useChartColors() {
  const colorMode = useColorMode();
  const colors = ref<string[]>(FALLBACK);

  function read() {
    const style = getComputedStyle(document.documentElement);
    colors.value = FALLBACK.map(
      (fallback, index) =>
        formatHex(style.getPropertyValue(`--chart-${index + 1}`).trim()) ?? fallback
    );
  }

  onMounted(read);
  watch(
    () => colorMode.value,
    () => nextTick(() => requestAnimationFrame(read))
  );

  return colors;
}
