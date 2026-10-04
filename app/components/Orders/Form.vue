<template>
  <form novalidate @submit="onSubmit">
    <UiAlert
      v-if="formError"
      variant="destructive"
      icon="lucide:circle-alert"
      :description="formError"
      class="mb-5"
    />
    <fieldset :disabled="isSubmitting" class="grid gap-6">
      <div class="grid gap-5 sm:grid-cols-2">
        <ResourceSelect
          resource="customers"
          name="customerId"
          form-label="Customer"
          placeholder="Search customers"
          required
          :label-of="(customer) => `${customer.name} (${customer.email})`"
          :selected="selectedCustomer"
        />
        <UiVeeSelect label="Status" name="status" required>
          <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
            {{ titleCase(status) }}
          </option>
        </UiVeeSelect>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-medium">Items</h2>
          <UiButton type="button" variant="outline" size="sm" @click="addItem">
            <Icon name="lucide:plus" />
            Add item
          </UiButton>
        </div>
        <p v-if="itemsError" class="text-sm text-destructive">{{ itemsError }}</p>
        <ul class="space-y-3">
          <li
            v-for="(field, index) in fields"
            :key="field.key"
            class="grid items-start gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_7rem_6rem_auto]"
          >
            <ResourceSelect
              resource="products"
              :name="`items[${index}].productId`"
              :form-label="index === 0 ? 'Product' : undefined"
              placeholder="Search products"
              :label-of="(product) => `${product.name} (${formatCurrency(product.price)})`"
              :params="{ status: 'active' }"
              :selected="selectedProducts"
              @loaded="rememberProducts"
            />
            <UiVeeInput
              :name="`items[${index}].quantity`"
              :label="index === 0 ? 'Quantity' : undefined"
              type="number"
              min="1"
              step="1"
              class="h-10"
            />
            <!-- The first row has labels above its fields, so these two are pushed down by the height of a label. -->
            <div
              class="flex h-10 items-center text-sm font-medium sm:justify-end"
              :class="index === 0 && 'sm:mt-[1.375rem]'"
            >
              {{ formatCurrency(lineTotal(index)) }}
            </div>
            <div class="flex h-10 items-center" :class="index === 0 && 'sm:mt-[1.375rem]'">
              <UiButton
                type="button"
                variant="ghost"
                size="icon"
                :aria-label="`Remove item ${index + 1}`"
                :disabled="fields.length <= 1"
                @click="remove(index)"
              >
                <Icon name="lucide:trash-2" />
              </UiButton>
            </div>
          </li>
        </ul>
        <div class="flex justify-end gap-3 text-sm">
          <span class="text-muted-foreground">Total</span>
          <span class="font-semibold">{{ formatCurrency(total) }}</span>
        </div>
      </div>

      <UiVeeTextarea
        label="Notes"
        name="notes"
        :rows="3"
        placeholder="Gift wrap, delivery instructions..."
      />

      <ResourceFormActions
        :cancel-to="record ? `/orders/${record.id}` : '/orders'"
        :submit-label="isEditing ? 'Save changes' : 'Create order'"
        :loading="isSubmitting"
      />
    </fieldset>
  </form>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record?: Order }>();

  const { onSubmit, isSubmitting, formError, isEditing, values, errors } = useResourceForm({
    resource: "orders",
    schema: orderSchema,
    recordId: props.record?.id,
    initialValues: props.record
      ? {
          customerId: props.record.customer.id,
          items: props.record.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          status: props.record.status,
          notes: props.record.notes,
        }
      : { customerId: "", items: [{ productId: "", quantity: 1 }], status: "pending", notes: "" },
  });

  const { fields, push, remove } = useFieldArray<{ productId: string; quantity: number }>("items");
  const addItem = () => push({ productId: "", quantity: 1 });
  const itemsError = computed(() => (errors.value as Record<string, string | undefined>).items);

  // The customer and products already on an order that is being edited. They may have been deleted
  // or archived since, so they are kept in the pickers even if a search wouldn't return them.
  const selectedCustomer = props.record
    ? [
        {
          value: props.record.customer.id,
          label: `${props.record.customer.name} (${props.record.customer.email})`,
        },
      ]
    : [];
  const selectedProducts = (props.record?.items ?? []).map((item) => ({
    value: item.productId,
    label: `${item.name} (${formatCurrency(item.price)})`,
  }));

  // Prices for the live total. Lines already on the order keep the price they were sold at.
  const prices = reactive(
    new Map<string, number>((props.record?.items ?? []).map((item) => [item.productId, item.price]))
  );
  function rememberProducts(products: Product[]) {
    for (const product of products)
      if (!prices.has(product.id)) prices.set(product.id, product.price);
  }

  const formValues = values as { items?: { productId: string; quantity: number | string }[] };

  const lineTotal = (index: number) => {
    const row = (formValues.items ?? [])[index];
    return (prices.get(row?.productId ?? "") ?? 0) * (Number(row?.quantity) || 0);
  };
  const total = computed(() =>
    (formValues.items ?? []).reduce((sum, _row, index) => sum + lineTotal(index), 0)
  );
</script>
