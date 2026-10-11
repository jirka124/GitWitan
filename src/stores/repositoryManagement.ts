import { defineStore } from 'pinia';
import type { ManagedRepository } from '../components/repository/management/repository-management.types';
import type { RepositoryRecord, RepositorySnapshot } from '../types/repository-data';

const toManagedRepository = (record: RepositoryRecord): ManagedRepository => ({
  key: record.repository.id,
  name: record.repository.displayName,
  path: record.repository.path,
  icon: record.repository.icon,
  dirtyCount: record.summary?.dirtyCount ?? 0,
  lastFetch: record.summary ? 'Not fetched' : 'Unavailable',
  commitCount: record.summary?.commitCount?.toString() ?? 'Unknown',
  lastCommit: record.summary?.lastCommitAt
    ? new Date(record.summary.lastCommitAt).toLocaleString()
    : 'Unknown',
  remotes: (record.summary?.remotes ?? []).map((remote) => ({
    name: remote.name,
    href: remote.url,
    status: 'available',
    tone: 'ok',
    lastFetch: 'Not fetched',
  })),
});

const createSnapshotVersions = (): Record<string, number> => ({});

export const useRepositoryManagementStore = defineStore('repositoryManagement', {
  state: () => ({
    repositories: [] as ManagedRepository[],
    isLoading: false,
    error: undefined as string | undefined,
    snapshotVersion: 0,
    snapshotVersions: createSnapshotVersions(),
    loadSequence: 0,
  }),

  getters: {
    repositoryCount: (state) => state.repositories.length,
  },

  actions: {
    async load() {
      if (!window.gitwitanRepositories) return;

      const sequence = ++this.loadSequence;
      const snapshotVersionAtStart = this.snapshotVersion;
      this.isLoading = true;
      this.error = undefined;
      try {
        const loadedRepositories = (await window.gitwitanRepositories.list()).map(
          toManagedRepository,
        );
        // A cache event may arrive while list() is in flight. Keep the newer
        // snapshot-derived item instead of replacing it with this older list
        // response. Ignore an obsolete concurrent load for the same reason.
        if (sequence !== this.loadSequence) return;

        const loadedByKey = new Map(
          loadedRepositories.map((repository) => [repository.key, repository]),
        );
        for (const repository of this.repositories) {
          if ((this.snapshotVersions[repository.key] ?? 0) > snapshotVersionAtStart) {
            loadedByKey.set(repository.key, repository);
          }
        }
        this.repositories = [...loadedByKey.values()];
      } catch (error: unknown) {
        if (sequence !== this.loadSequence) return;
        this.error = error instanceof Error ? error.message : 'Unable to load repositories.';
      } finally {
        if (sequence === this.loadSequence) this.isLoading = false;
      }
    },

    applyRecord(record: RepositoryRecord) {
      const repository = toManagedRepository(record);
      const index = this.repositories.findIndex((item) => item.key === repository.key);

      if (index === -1) this.repositories.unshift(repository);
      else this.repositories.splice(index, 1, repository);
    },

    applySnapshot(snapshot: RepositorySnapshot) {
      this.snapshotVersion += 1;
      this.snapshotVersions[snapshot.repository.id] = this.snapshotVersion;
      this.applyRecord({
        repository: snapshot.repository,
        summary: snapshot.summary,
        error: snapshot.error,
      });
    },

    async clone(repositoryUrl: string, parentFolder: string, folderName: string) {
      if (!window.gitwitanRepositories) {
        this.error = 'Repository cloning is available only in the Electron app.';
        return undefined;
      }

      this.isLoading = true;
      this.error = undefined;
      try {
        const record = await window.gitwitanRepositories.clone(
          repositoryUrl,
          parentFolder,
          folderName,
        );
        this.applyRecord(record);
        return record.repository.id;
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Unable to clone repository.';
        return undefined;
      } finally {
        this.isLoading = false;
      }
    },

    async openInitRepositoryPicker() {
      const selectedPath = await window.gitwitanShell?.selectFolder?.();
      if (!selectedPath) return undefined;

      if (!window.gitwitanRepositories) {
        this.error = 'Repository initialization is available only in the Electron app.';
        return undefined;
      }

      this.isLoading = true;
      this.error = undefined;
      try {
        const record = await window.gitwitanRepositories.init(selectedPath);
        this.applyRecord(record);
        return record.repository.id;
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Unable to initialize repository.';
        return undefined;
      } finally {
        this.isLoading = false;
      }
    },

    async openAddExistingRepositoryPicker() {
      const selectedPath = await window.gitwitanShell?.selectFolder?.();
      if (!selectedPath) return undefined;

      if (!window.gitwitanRepositories) {
        this.error = 'Repository tracking is available only in the Electron app.';
        return undefined;
      }

      try {
        const record = await window.gitwitanRepositories.addExisting(selectedPath);
        this.applyRecord(record);
        return record.repository.id;
      } catch (error: unknown) {
        this.error =
          error instanceof Error ? error.message : 'Selected folder is not a Git repository.';
        return undefined;
      }
    },

    async refresh(repositoryId: string) {
      if (!window.gitwitanRepositories) return;

      try {
        this.applyRecord(await window.gitwitanRepositories.refresh(repositoryId));
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Unable to refresh repository.';
      }
    },
  },
});
