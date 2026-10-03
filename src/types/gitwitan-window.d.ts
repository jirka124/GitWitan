import type { RepositoryRecord, RepositoryStatus, RepositoryWorkspaceOverview } from './repository-data';

declare global {
  interface Window {
    gitwitanRepositories?: {
      list: () => Promise<RepositoryRecord[]>;
      addExisting: (folderPath: string) => Promise<RepositoryRecord>;
      clone: (repositoryUrl: string, parentFolder: string, folderName: string) => Promise<RepositoryRecord>;
      init: (folderPath: string) => Promise<RepositoryRecord>;
      refresh: (repositoryId: string) => Promise<RepositoryRecord>;
      status: (repositoryId: string) => Promise<RepositoryStatus>;
      overview: (repositoryId: string) => Promise<RepositoryWorkspaceOverview>;
      diff: (repositoryId: string, filePath: string, staged: boolean, untracked: boolean) => Promise<string>;
      stage: (repositoryId: string, filePaths: string[]) => Promise<void>;
      unstage: (repositoryId: string, filePaths: string[]) => Promise<void>;
    };
  }
}

export {};
