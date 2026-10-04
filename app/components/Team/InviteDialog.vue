<template>
  <UiDialog :open="open" @update:open="onOpen">
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle title="Invite a team member" />
        <UiDialogDescription
          description="They are sent a link to join your team. It works for 7 days."
        />
      </UiDialogHeader>

      <form novalidate @submit="onSubmit">
        <UiAlert
          v-if="formError"
          variant="destructive"
          icon="lucide:circle-alert"
          :description="formError"
          class="mb-4"
        />
        <fieldset :disabled="isSubmitting" class="grid gap-4">
          <UiVeeInput
            label="Email address"
            name="email"
            type="email"
            placeholder="new.hire@example.com"
            autocomplete="off"
            required
          />
          <UiVeeSelect label="Role" name="role" required>
            <option disabled value="">Select a role</option>
            <option v-for="role in STAFF_ROLES" :key="role" :value="role">
              {{ titleCase(role) }}
            </option>
          </UiVeeSelect>
          <UiVeeTextarea
            label="Message (optional)"
            name="message"
            :rows="3"
            placeholder="Add a short note to the invitation"
          />
          <UiDialogFooter class="pt-2">
            <UiButton type="button" variant="outline" @click="onOpen(false)">Cancel</UiButton>
            <UiButton type="submit" :loading="isSubmitting">Send invitation</UiButton>
          </UiDialogFooter>
        </fieldset>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  defineProps<{ open: boolean }>();
  const emit = defineEmits<{ close: []; invited: [invitation: Invitation] }>();

  const formError = ref("");
  const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: toTypedSchema(inviteSchema),
    initialValues: { role: "", message: "" } as never,
  });

  function onOpen(value: boolean) {
    if (value) return;
    emit("close");
    // Start empty the next time the dialog opens.
    formError.value = "";
    resetForm({ values: { email: "", role: "", message: "" } as never });
  }

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      const invitation = await $fetch<Invitation>("/api/team/invitations", {
        method: "POST",
        body: values,
      });
      useSonner("Invitation sent", {
        description: `${invitation.email} was invited as ${invitation.role}.`,
      });
      emit("invited", invitation);
      onOpen(false);
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });
</script>
