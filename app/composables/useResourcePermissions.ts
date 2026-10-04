/** Whether the signed-in user may create, edit and delete records of a resource. */
export function useResourcePermissions(resource: MaybeRefOrGetter<ResourceName>) {
  const { can } = useAuth();
  const canWrite = computed(() => {
    const permission = resourcePermission(toValue(resource), "write");
    return !permission || can(permission);
  });
  return { canWrite };
}
