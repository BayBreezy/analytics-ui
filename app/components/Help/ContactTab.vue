<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Contact support</UiCardTitle>
        <UiCardDescription>
          Tell us what's going on. This is a demo, so nobody will actually reply.
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
            <UiVeeInput label="Subject" name="subject" placeholder="What do you need help with?" />
            <div class="grid gap-5 sm:grid-cols-2">
              <UiVeeSelect label="Category" name="category">
                <option v-for="category in TICKET_CATEGORIES" :key="category" :value="category">
                  {{ CATEGORY_LABELS[category] }}
                </option>
              </UiVeeSelect>
              <UiVeeSelect label="Priority" name="priority">
                <option v-for="priority in TICKET_PRIORITIES" :key="priority" :value="priority">
                  {{ titleCase(priority) }}
                </option>
              </UiVeeSelect>
            </div>
            <UiVeeTextarea
              label="Message"
              name="message"
              :rows="5"
              placeholder="Describe the problem, and what you expected to happen"
            />
            <div class="flex justify-end">
              <UiButton type="submit" :loading="isSubmitting">Send message</UiButton>
            </div>
          </fieldset>
        </form>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Your requests</UiCardTitle>
        <UiCardDescription>Messages you have sent to support.</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <AppErrorState v-if="error && !tickets" what="your requests" @retry="emit('retry')" />
        <div v-else-if="!tickets" class="space-y-3">
          <UiSkeleton v-for="n in 3" :key="n" class="h-20 w-full" />
        </div>
        <UiEmpty v-else-if="!tickets.length" class="min-h-40 p-4">
          <UiEmptyHeader>
            <UiEmptyMedia variant="icon"><Icon name="lucide:inbox" /></UiEmptyMedia>
            <UiEmptyTitle>No requests yet</UiEmptyTitle>
            <UiEmptyDescription>Your messages to support will show up here.</UiEmptyDescription>
          </UiEmptyHeader>
        </UiEmpty>
        <ul v-else class="space-y-3">
          <li v-for="ticket in tickets" :key="ticket.id" class="rounded-lg border p-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <p class="min-w-0 flex-1 basis-40 text-sm font-medium">{{ ticket.subject }}</p>
              <UiBadge
                :variant="TICKET_STATUS_VARIANTS[ticket.status]"
                size="sm"
                class="capitalize"
              >
                {{ ticket.status }}
              </UiBadge>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ CATEGORY_LABELS[ticket.category] }} · {{ titleCase(ticket.priority) }} priority ·
              {{ formatRelative(ticket.createdAt) }}
            </p>
            <p class="mt-2 line-clamp-3 text-sm text-muted-foreground">{{ ticket.message }}</p>
            <div v-if="ticket.reply" class="mt-2 rounded-md bg-muted p-2 text-sm">
              <span class="font-medium">Support:</span> {{ ticket.reply }}
            </div>
            <UiButton
              v-if="ticket.status !== 'closed'"
              variant="ghost"
              size="sm"
              class="mt-2 -ml-2"
              :loading="closing === ticket.id"
              @click="close(ticket)"
            >
              Close request
            </UiButton>
          </li>
        </ul>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  import { toTypedSchema } from "@vee-validate/zod";

  defineProps<{ tickets?: Ticket[]; error?: unknown }>();
  const emit = defineEmits<{ retry: []; changed: [] }>();

  const CATEGORY_LABELS: Record<TicketCategory, string> = {
    orders: "Orders",
    billing: "Billing",
    account: "Account",
    bug: "Something is broken",
    other: "Something else",
  };
  const TICKET_STATUS_VARIANTS = {
    open: "info",
    answered: "success",
    closed: "secondary",
  } as const;

  const formError = ref("");
  const closing = ref<string>();

  const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: toTypedSchema(ticketSchema),
    initialValues: { category: "orders", priority: "normal" } as never,
  });

  const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
      await $fetch("/api/support/tickets", { method: "POST", body: values });
      resetForm({ values: { category: "orders", priority: "normal" } as never });
      useSonner("Message sent", { description: "It's listed under your requests." });
      emit("changed");
    } catch (error) {
      formError.value = getErrorMessage(error);
    }
  });

  async function close(ticket: Ticket) {
    closing.value = ticket.id;
    try {
      await $fetch(`/api/support/tickets/${ticket.id}/close`, { method: "POST" });
      useSonner("Request closed");
      emit("changed");
    } catch (error) {
      useSonner.error("Couldn't close the request", { description: getErrorMessage(error) });
    } finally {
      closing.value = undefined;
    }
  }
</script>
