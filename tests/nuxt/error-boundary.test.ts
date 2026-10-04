import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { AppErrorState, NuxtErrorBoundary } from "#components";

// The default layout wraps the page in a NuxtErrorBoundary with an AppErrorState as its fallback,
// so a page that throws leaves the sidebar usable and offers a retry.
describe("page error boundary", () => {
  it("shows the fallback with a retry when a page throws, and the page again after retrying", async () => {
    const broken = ref(true);
    const Page = defineComponent({
      setup() {
        if (broken.value) throw new Error("boom");
        return () => h("p", "the page");
      },
    });
    const wrapper = await mountSuspended({
      render: () =>
        h(NuxtErrorBoundary, null, {
          default: () => h(Page),
          error: ({ clearError }: { clearError: () => void }) =>
            h(AppErrorState, { what: "this page", onRetry: () => clearError() }),
        }),
    });

    expect(wrapper.text()).toContain("Couldn't load this page");
    expect(wrapper.text()).not.toContain("the page");

    broken.value = false;
    await wrapper.findComponent({ name: "UiButton" }).trigger("click");
    expect(wrapper.text()).toContain("the page");
  });
});

describe("AppErrorState", () => {
  it("names what failed and emits retry", async () => {
    const wrapper = await mountSuspended(AppErrorState, { props: { what: "customers" } });
    expect(wrapper.text()).toContain("Couldn't load customers");
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
