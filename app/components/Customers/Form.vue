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
        <UiVeeInput label="Full name" name="name" placeholder="Jane Doe" required />
        <UiVeeInput
          label="Email address"
          name="email"
          type="email"
          placeholder="jane@example.com"
          required
        />
        <UiVeeInput label="Phone" name="phone" type="tel" placeholder="555-123-4567" required />
        <UiVeeSelect label="Status" name="status" required>
          <option v-for="status in CUSTOMER_STATUSES" :key="status" :value="status">
            {{ titleCase(status) }}
          </option>
        </UiVeeSelect>
        <UiVeeInput label="City" name="city" placeholder="Austin" required />
        <UiVeeInput label="Country" name="country" placeholder="United States" required />
      </div>
      <ResourceFormActions
        :cancel-to="record ? `/customers/${record.id}` : '/customers'"
        :submit-label="isEditing ? 'Save changes' : 'Create customer'"
        :loading="isSubmitting"
      />
    </fieldset>
  </form>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record?: Customer }>();

  const { onSubmit, isSubmitting, formError, isEditing } = useResourceForm({
    resource: "customers",
    schema: customerSchema,
    recordId: props.record?.id,
    initialValues: props.record
      ? {
          name: props.record.name,
          email: props.record.email,
          phone: props.record.phone,
          city: props.record.city,
          country: props.record.country,
          status: props.record.status,
        }
      : { status: "active" },
  });
</script>
