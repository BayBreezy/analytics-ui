<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Personal info</UiCardTitle>
      <UiCardDescription>
        This is how you appear in the sidebar and to your team.
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <UiAlert
        v-if="formError"
        variant="destructive"
        icon="lucide:circle-alert"
        :description="formError"
        class="mb-5"
      />
      <form novalidate @submit="onSubmit">
        <fieldset :disabled="isSubmitting" class="grid gap-5">
          <ProfileAvatarPicker
            v-model="avatar"
            :current="user?.avatar"
            :initials="initials"
            :error-message="avatarError"
          />
          <div class="grid gap-5 sm:grid-cols-2">
            <UiVeeInput label="Full name" name="name" autocomplete="name" required />
            <UiVeeInput
              label="Email address"
              name="email"
              type="email"
              autocomplete="email"
              required
            />
            <UiVeeInput label="Job title" name="jobTitle" placeholder="Store manager" />
            <UiVeeInput label="Phone" name="phone" type="tel" placeholder="555-123-4567" />
          </div>
          <UiVeeTextarea
            label="Bio"
            name="bio"
            :rows="3"
            placeholder="A line or two about you"
            hint="Up to 200 characters."
          />
          <div class="flex flex-wrap justify-end gap-2">
            <UiButton type="button" variant="outline" :disabled="!meta.dirty" @click="onReset">
              Reset
            </UiButton>
            <UiButton type="submit" :loading="isSubmitting" :disabled="!meta.dirty">
              Save changes
            </UiButton>
          </div>
        </fieldset>
      </form>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  const { user, updateUser } = useAuth();
  const formError = ref("");

  const initialValues = () => ({
    name: user.value?.name ?? "",
    email: user.value?.email ?? "",
    jobTitle: user.value?.jobTitle ?? "",
    phone: user.value?.phone ?? "",
    bio: user.value?.bio ?? "",
    avatar: user.value?.avatar ?? AVATAR_PRESETS[0]!,
  });

  const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
    validationSchema: toTypedSchema(profileSchema),
    initialValues: initialValues(),
  });
  const { value: avatar, errorMessage: avatarError } = useField<string>("avatar");

  const initials = computed(() =>
    (user.value?.name ?? "")
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  );

  const onReset = () => {
    formError.value = "";
    resetForm({ values: initialValues() });
  };

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      const saved = await $fetch<AuthUser>("/api/account/profile", {
        method: "PUT",
        body: values,
      });
      updateUser(saved);
      // The saved values are the new baseline, so the form isn't dirty any more.
      resetForm({ values: initialValues() });
      useSonner("Profile updated");
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });
</script>
