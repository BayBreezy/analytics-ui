<template>
  <form novalidate @submit="onSubmit">
    <UiAlert
      v-if="formError"
      variant="destructive"
      icon="lucide:circle-alert"
      :description="formError"
      class="mb-5"
    />
    <fieldset :disabled="isSubmitting" class="grid gap-5">
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <UiVeeInput label="Product name" name="name" placeholder="Wireless headphones" required />
        </div>
        <UiVeeInput label="SKU" name="sku" placeholder="ELE-10024" required />
        <UiVeeSelect label="Category" name="category" required>
          <option disabled value="">Select a category</option>
          <option v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
            {{ category }}
          </option>
        </UiVeeSelect>
        <UiVeeInput
          label="Price (USD)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
        <UiVeeInput
          label="Stock"
          name="stock"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          required
        />
        <UiVeeSelect label="Status" name="status" required>
          <option v-for="status in PRODUCT_STATUSES" :key="status" :value="status">
            {{ titleCase(status) }}
          </option>
        </UiVeeSelect>
        <div class="sm:col-span-2">
          <UiVeeTextarea
            label="Description"
            name="description"
            :rows="4"
            placeholder="What makes this product great?"
          />
        </div>
      </div>
      <ResourceFormActions
        :cancel-to="record ? `/products/${record.id}` : '/products'"
        :submit-label="isEditing ? 'Save changes' : 'Create product'"
        :loading="isSubmitting"
      />
    </fieldset>
  </form>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record?: Product }>();

  const { onSubmit, isSubmitting, formError, isEditing } = useResourceForm({
    resource: "products",
    schema: productSchema,
    recordId: props.record?.id,
    initialValues: props.record
      ? {
          name: props.record.name,
          sku: props.record.sku,
          category: props.record.category,
          price: props.record.price,
          stock: props.record.stock,
          status: props.record.status,
          description: props.record.description,
        }
      : { category: "", status: "active", description: "" },
  });
</script>
