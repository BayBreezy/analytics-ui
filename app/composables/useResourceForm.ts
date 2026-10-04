import { toTypedSchema } from "@vee-validate/zod";
import type { z } from "zod";

/**
 * The create/edit form logic shared by every resource: validate with the resource's zod schema,
 * POST (create) or PUT (edit) to the mock API, toast, then go to the record's details page.
 */
export function useResourceForm<K extends ResourceName>(options: {
  resource: K;
  schema: z.ZodTypeAny;
  initialValues?: Record<string, unknown>;
  /** The id of the record being edited. Leave out to create a new one. */
  recordId?: string;
}) {
  const { singular, base } = RESOURCES[options.resource];
  const formError = ref("");

  const form = useForm({
    validationSchema: toTypedSchema(options.schema),
    initialValues: options.initialValues as never,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    formError.value = "";
    try {
      const saved = await $fetch<ResourceMap[K]>(
        options.recordId
          ? `/api/${options.resource}/${options.recordId}`
          : `/api/${options.resource}`,
        { method: options.recordId ? "PUT" : "POST", body: values }
      );
      useSonner(`${singular} ${options.recordId ? "updated" : "created"}`, {
        description: options.recordId ? "Your changes have been saved." : "It's now in the list.",
      });
      await navigateTo(`${base}/${saved.id}`);
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });

  return { ...form, onSubmit, formError, isEditing: Boolean(options.recordId) };
}
