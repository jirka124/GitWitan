import type { RepositoryRecord } from './repository-data';

declare global {
  interface Window {
    gitwitanRepositories?: {
      list: () => Promise<RepositoryRecord[]>;
      addExisting: (folderPath: string) => Promise<RepositoryRecord>;
      refresh: (repositoryId: string) => Promise<RepositoryRecord>;
    };
  }
}

export {};
