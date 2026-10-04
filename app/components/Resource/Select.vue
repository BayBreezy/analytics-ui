<template>
  <UiVeeMultiSelect
    :name="name"
    :form-label="formLabel"
    :placeholder="placeholder"
    :hint="hint"
    :required="required"
    searchable
    :can-clear="false"
    :can-deselect="false"
    :options="loadOptions"
    :filter-results="false"
    :min-chars="0"
    :delay="250"
    :no-results-text="`No ${resource} found`"
    :no-options-text="`No ${resource} yet`"
  />
</template>

<script lang="ts" setup>
  /**
   * A searchable picker for a record, e.g. the customer or a product on an order. It asks the API as
   * you type (20 results at a time), so it stays short however many records there are.
   */
  const props = defineProps<{
    resource: "customers" | "products";
    /** The field name in the parent `useForm`. */
    name: string;
    formLabel?: string;
    placeholder?: string;
    hint?: string;
    required?: boolean;
    /** How a record is shown in the list. */
    labelOf: (item: any) => string;
    /** Extra query params for the API, e.g. `{ status: "active" }`. */
    params?: Record<string, string>;
    /**
     * Records that must stay selectable even if the search wouldn't return them, such as the
     * customer on an order that is being edited.
     */
    selected?: { value: string; label: string }[];
  }>();

  /** Every record the API returns, so the parent can read things like a product's price. */
  const emit = defineEmits<{ loaded: [items: any[]] }>();

  async function loadOptions(query?: string) {
    const response = await $fetch<Paginated<any>>(`/api/${props.resource}`, {
      query: {
        pageSize: 20,
        sort: "name",
        order: "asc",
        ...(query && { search: query }),
        ...props.params,
      },
    });
    emit("loaded", response.items);

    const fetched = response.items.map((item) => ({ value: item.id, label: props.labelOf(item) }));
    const needle = query?.toLowerCase();
    const extras = (props.selected ?? []).filter(
      (extra) =>
        !fetched.some((item) => item.value === extra.value) &&
        (!needle || extra.label.toLowerCase().includes(needle))
    );
    return [...extras, ...fetched];
  }
</script>
