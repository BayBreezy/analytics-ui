// Deletes or changes the status of several records. Each record goes through the same code as the
// single-record routes, so the checks still apply (for example the last admin can't be removed), and
// one failure doesn't stop the others.
export default defineEventHandler(async (event): Promise<BulkResult> => {
  const name = getResourceParam(event);
  requirePermission(event, resourcePermission(name, "write")!);
  const { action, ids, status } = await validateBody(event, bulkSchema);

  let patch: Record<string, unknown> | undefined;
  if (action === "update") {
    const parsed = resourceSchemas[name].partial().safeParse({ status });
    if (!status || !parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation Error",
        message: `"${status ?? ""}" isn't a valid ${RESOURCES[name].singular.toLowerCase()} status`,
      });
    }
    patch = { status: parsed.data.status };
  }
  await delay();

  const result: BulkResult = { done: 0, failed: [] };
  for (const id of ids) {
    try {
      if (patch) updateResource(name, id, patch);
      else deleteResource(name, id);
      result.done++;
    } catch (error) {
      result.failed.push({
        id,
        message: (error as { message?: string }).message ?? "Something went wrong",
      });
    }
  }
  return result;
});
