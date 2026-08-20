import { defineStore } from 'pinia';
import { managedRepositories } from '../components/repository/management/repository-management.mock';
import type { ManagedRepository } from '../components/repository/management/repository-management.types';

const normalizePath = (folderPath: string) => folderPath.replace(/\\/g, '/').replace(/\/+$/, '');

const getFolderName = (folderPath: string) => {
  const normalizedPath = normalizePath(folderPath);
  return normalizedPath.split('/').filter(Boolean).at(-1) ?? 'Repository';
};

const toTitle = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());

const toRepositoryKey = (folderName: string) =>
  folderName
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'repository';

const createUniqueKey = (baseKey: string, repositories: ManagedRepository[]) => {
  let candidateKey = baseKey;
  let suffix = 2;

  while (repositories.some((repository) => repository.key === candidateKey)) {
    candidateKey = `${baseKey}-${suffix}`;
    suffix += 1;
  }

  return candidateKey;
};

const createTrackedRepository = (
  folderPath: string,
  repositories: ManagedRepository[],
): ManagedRepository => {
  const normalizedPath = normalizePath(folderPath);
  const folderName = getFolderName(normalizedPath);
  const key = createUniqueKey(toRepositoryKey(folderName), repositories);

  return {
    key,
    name: toTitle(folderName),
    path: normalizedPath,
    icon: 'folder_special',
    dirtyCount: 0,
    lastFetch: 'Never',
    commitCount: 'Unknown',
    lastCommit: 'Unknown',
    remotes: [],
  };
};

export const useRepositoryManagementStore = defineStore('repositoryManagement', {
  state: () => ({
    repositories: managedRepositories.map((repository) => ({ ...repository })),
  }),

  getters: {
    repositoryCount: (state) => state.repositories.length,
  },

  actions: {
    addTrackedRepository(folderPath: string) {
      const normalizedPath = normalizePath(folderPath);
      const existingRepository = this.repositories.find(
        (repository) =>
          normalizePath(repository.path).toLocaleLowerCase() === normalizedPath.toLocaleLowerCase(),
      );

      if (existingRepository) {
        return existingRepository.key;
      }

      const repository = createTrackedRepository(normalizedPath, this.repositories);
      this.repositories.unshift(repository);
      return repository.key;
    },

    async openInitRepositoryPicker() {
      const selectedPath = await window.gitwitanShell?.selectFolder?.();

      if (!selectedPath) {
        return undefined;
      }

      return this.addTrackedRepository(selectedPath);
    },
  },
});
