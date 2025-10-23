import type { DemoCacheRecord } from "../types/demo";

declare global {
  // eslint-disable-next-line no-var
  var __localiqDemoCache: Map<string, DemoCacheRecord> | undefined;
}

const cache: Map<string, DemoCacheRecord> =
  globalThis.__localiqDemoCache ?? new Map<string, DemoCacheRecord>();

if (!globalThis.__localiqDemoCache) {
  globalThis.__localiqDemoCache = cache;
}

export function upsertDemoCache(record: DemoCacheRecord) {
  cache.set(record.id, record);
}

export function getDemoFromCache(id: string) {
  return cache.get(id) ?? null;
}

export function listDemoCache() {
  return Array.from(cache.values());
}

export function deleteDemoFromCache(id: string) {
  cache.delete(id);
}
