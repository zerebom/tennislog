export function useSupabaseSync() {
  // Stub: no sync needed in local mode
  return { syncing: false, synced: true }
}
