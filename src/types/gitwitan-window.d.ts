import type { RepositoryRecord, RepositoryStatus } from './repository-data';

declare global {
  interface Window {
    gitwitanRepositories?: {
      list: () => Promise<RepositoryRecord[]>;
      addExisting: (folderPath: string) => Promise<RepositoryRecord>;
      refresh: (repositoryId: string) => Promise<RepositoryRecord>;
      status: (repositoryId: string) => Promise<RepositoryStatus>;
      diff: (repositoryId: string, filePath: string, staged: boolean) => Promise<string>;
      stage: (repositoryId: string, filePaths: string[]) => Promise<void>;
      unstage: (repositoryId: string, filePaths: string[]) => Promise<void>;
    };
  }
}

export {};
