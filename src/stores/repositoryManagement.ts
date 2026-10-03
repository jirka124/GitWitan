import { defineStore } from 'pinia';
import type { ManagedRepository } from '../components/repository/management/repository-management.types';
import type { RepositoryRecord } from '../types/repository-data';

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

export const useRepositoryManagementStore = defineStore('repositoryManagement', {
  state: () => ({
    repositories: [] as ManagedRepository[],
    isLoading: false,
    error: undefined as string | undefined,
  }),

  getters: {
    repositoryCount: (state) => state.repositories.length,
  },

  actions: {
    async load() {
      if (!window.gitwitanRepositories) return;

      this.isLoading = true;
      this.error = undefined;
      try {
        this.repositories = (await window.gitwitanRepositories.list()).map(toManagedRepository);
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Unable to load repositories.';
      } finally {
        this.isLoading = false;
      }
    },

    applyRecord(record: RepositoryRecord) {
      const repository = toManagedRepository(record);
      const index = this.repositories.findIndex((item) => item.key === repository.key);

      if (index === -1) this.repositories.unshift(repository);
      else this.repositories.splice(index, 1, repository);
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
        this.error = error instanceof Error ? error.message : 'Selected folder is not a Git repository.';
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
