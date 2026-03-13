'use client';

import localforage from 'localforage';
import { CanonicalFrameworkPayload } from '@/types/canonical-framework-payload';

const snapshotStore = localforage.createInstance({
  name: 'ZeroBarriers',
  storeName: 'framework_snapshots',
  description: 'Canonical framework payload snapshots',
});

export async function saveSnapshot(
  snapshotId: string,
  payload: CanonicalFrameworkPayload
): Promise<void> {
  await snapshotStore.setItem(snapshotId, payload);
}

export async function loadSnapshot(
  snapshotId: string
): Promise<CanonicalFrameworkPayload | null> {
  return snapshotStore.getItem<CanonicalFrameworkPayload>(snapshotId);
}
