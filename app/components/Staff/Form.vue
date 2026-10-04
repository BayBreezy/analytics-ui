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
        <UiVeeInput label="Full name" name="name" placeholder="Sam Support" required />
        <UiVeeInput
          label="Email address"
          name="email"
          type="email"
          placeholder="sam@analytics.test"
          required
        />
        <UiVeeInput label="Phone" name="phone" type="tel" placeholder="555-123-4567" required />
        <UiVeeSelect label="Role" name="role" required>
          <option disabled value="">Select a role</option>
          <option v-for="role in STAFF_ROLES" :key="role" :value="role">
            {{ titleCase(role) }}
          </option>
        </UiVeeSelect>
        <UiVeeSelect label="Status" name="status" required>
          <option v-for="status in STAFF_STATUSES" :key="status" :value="status">
            {{ titleCase(status) }}
          </option>
        </UiVeeSelect>
      </div>
      <ResourceFormActions
        :cancel-to="record ? `/staff/${record.id}` : '/staff'"
        :submit-label="isEditing ? 'Save changes' : 'Add team member'"
        :loading="isSubmitting"
      />
    </fieldset>
  </form>
</template>

<script lang="ts" setup>
  const props = defineProps<{ record?: StaffMember }>();

  const { onSubmit, isSubmitting, formError, isEditing } = useResourceForm({
    resource: "staff",
    schema: staffSchema,
    recordId: props.record?.id,
    initialValues: props.record
      ? {
          name: props.record.name,
          email: props.record.email,
          phone: props.record.phone,
          role: props.record.role,
          status: props.record.status,
        }
      : { role: "", status: "active" },
  });
</script>
