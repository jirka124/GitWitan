import { defineStore } from 'pinia';
import type { RepositorySnapshot, RepositoryStatusUpdate } from '../types/repository-data';

const createSnapshots = (): Record<string, RepositorySnapshot> => ({});
const createPendingStatusUpdates = (): Record<string, RepositoryStatusUpdate | undefined> => ({});
type SnapshotListener = (snapshot: RepositorySnapshot) => void;

export const useRepositorySnapshotsStore = defineStore('repositorySnapshots', {
  state: () => ({
    snapshots: createSnapshots(),
    initialized: false,
    initialization: undefined as Promise<void> | undefined,
    unsubscribe: undefined as (() => void) | undefined,
    unsubscribeStatus: undefined as (() => void) | undefined,
    pendingStatusUpdates: createPendingStatusUpdates(),
    sessionSync: Promise.resolve(),
    listeners: new Set<SnapshotListener>(),
  }),

  actions: {
    apply(snapshot: RepositorySnapshot) {
      const current = this.snapshots[snapshot.repository.id];
      if (
        current?.updatedAt &&
        snapshot.updatedAt &&
        Date.parse(current.updatedAt) > Date.parse(snapshot.updatedAt)
      ) {
        return;
      }
      const pendingStatus = this.pendingStatusUpdates[snapshot.repository.id];
      const usePendingStatus =
        pendingStatus &&
        (!snapshot.updatedAt ||
          !pendingStatus.updatedAt ||
          Date.parse(pendingStatus.updatedAt) >= Date.parse(snapshot.updatedAt));
      const nextSnapshot = usePendingStatus
        ? {
            ...snapshot,
            status: pendingStatus.status,
            summary: snapshot.summary
              ? {
                  ...snapshot.summary,
                  dirtyCount: pendingStatus.dirtyCount ?? snapshot.summary.dirtyCount,
                }
              : snapshot.summary,
            updatedAt: pendingStatus.updatedAt,
            error: pendingStatus.error,
          }
        : snapshot;

      delete this.pendingStatusUpdates[snapshot.repository.id];
      this.snapshots[snapshot.repository.id] = nextSnapshot;
      this.listeners.forEach((listener) => listener(nextSnapshot));
    },

    onChanged(listener: SnapshotListener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    },

    applyStatus(update: RepositoryStatusUpdate) {
      const current = this.snapshots[update.repositoryId];
      if (!current) {
        // During bootstrap a status event can legitimately arrive before its
        // complete snapshot. Once initialized, however, the cache only emits
        // updates for entries it already exposes. Dropping an unknown update
        // prevents a removed repository ID from being retained indefinitely.
        if (this.initialized) return;
        this.pendingStatusUpdates[update.repositoryId] = update;
        return;
      }
      if (
        current.updatedAt &&
        update.updatedAt &&
        Date.parse(current.updatedAt) > Date.parse(update.updatedAt)
      ) {
        return;
      }

      this.apply({
        ...current,
        status: update.status,
        summary: current.summary
          ? { ...current.summary, dirtyCount: update.dirtyCount ?? current.summary.dirtyCount }
          : current.summary,
        updatedAt: update.updatedAt,
        error: update.error,
      });
    },

    async initialize() {
      if (this.initialized) return;
      if (this.initialization) return this.initialization;
      this.initialization = (async () => {
        if (!window.gitwitanRepositories) return;
        // Subscribe first so an update emitted while bootstrap is in flight
        // cannot be missed. `apply` keeps a newer event from being replaced
        // by an older bootstrap result.
        this.unsubscribe = window.gitwitanRepositories.onSnapshotChanged((snapshot) =>
          this.apply(snapshot),
        );
        this.unsubscribeStatus = window.gitwitanRepositories.onStatusChanged((update) =>
          this.applyStatus(update),
        );
        try {
          const snapshots = await window.gitwitanRepositories.bootstrap();
          const repositoryIds = new Set(snapshots.map((snapshot) => snapshot.repository.id));
          for (const repositoryId of Object.keys(this.pendingStatusUpdates)) {
            if (!repositoryIds.has(repositoryId)) delete this.pendingStatusUpdates[repositoryId];
          }
          snapshots.forEach((snapshot) => this.apply(snapshot));
          this.initialized = true;
        } catch (error) {
          this.unsubscribe?.();
          this.unsubscribe = undefined;
          this.unsubscribeStatus?.();
          this.unsubscribeStatus = undefined;
          throw error;
        }
      })();
      try {
        await this.initialization;
      } finally {
        this.initialization = undefined;
      }
    },

    async load(repositoryId: string) {
      await this.initialize();
      if (!window.gitwitanRepositories) return;
      const snapshot = await window.gitwitanRepositories.activate(repositoryId);
      if (snapshot) this.apply(snapshot);
    },

    async forceRefresh(repositoryId: string) {
      await this.initialize();
      if (!window.gitwitanRepositories) return;
      const snapshot = await window.gitwitanRepositories.forceRefresh(repositoryId);
      if (snapshot) this.apply(snapshot);
    },

    async syncOpen(repositoryIds: string[]) {
      await this.initialize();
      if (window.gitwitanRepositories) await window.gitwitanRepositories.setOpen(repositoryIds);
    },

    async syncSession(openRepositoryIds: string[], activeRepositoryId?: string) {
      await this.initialize();
      if (!window.gitwitanRepositories) return;

      // Route/tab changes can happen faster than IPC completes. Keep the requests ordered so
      // the main process always finishes with the latest renderer session state.
      this.sessionSync = this.sessionSync
        .catch(() => undefined)
        .then(async () => {
          const snapshot = await window.gitwitanRepositories?.syncSession({
            openRepositoryIds,
            ...(activeRepositoryId ? { activeRepositoryId } : {}),
          });
          if (snapshot) this.apply(snapshot);
        });
      await this.sessionSync;
    },
  },
});
