import type {
  RepositoryRecord,
  RepositorySnapshot,
  RepositoryStatus,
  RepositoryStatusUpdate,
  RepositoryWorkspaceOverview,
} from './repository-data';

declare global {
  interface Window {
    gitwitanRepositories?: {
      list: () => Promise<RepositoryRecord[]>;
      bootstrap: () => Promise<RepositorySnapshot[]>;
      snapshot: (repositoryId: string) => Promise<RepositorySnapshot | undefined>;
      activate: (repositoryId: string) => Promise<RepositorySnapshot | undefined>;
      forceRefresh: (repositoryId: string) => Promise<RepositorySnapshot | undefined>;
      setOpen: (repositoryIds: string[]) => Promise<void>;
      syncSession: (session: {
        openRepositoryIds: string[];
        activeRepositoryId?: string;
      }) => Promise<RepositorySnapshot | undefined>;
      onSnapshotChanged: (listener: (snapshot: RepositorySnapshot) => void) => () => void;
      onStatusChanged: (listener: (update: RepositoryStatusUpdate) => void) => () => void;
      addExisting: (folderPath: string) => Promise<RepositoryRecord>;
      clone: (
        repositoryUrl: string,
        parentFolder: string,
        folderName: string,
      ) => Promise<RepositoryRecord>;
      init: (folderPath: string) => Promise<RepositoryRecord>;
      refresh: (repositoryId: string) => Promise<RepositoryRecord>;
      status: (repositoryId: string) => Promise<RepositoryStatus>;
      overview: (repositoryId: string) => Promise<RepositoryWorkspaceOverview>;
      diff: (
        repositoryId: string,
        filePath: string,
        staged: boolean,
        untracked: boolean,
      ) => Promise<string>;
      stage: (repositoryId: string, filePaths: string[]) => Promise<void>;
      unstage: (repositoryId: string, filePaths: string[]) => Promise<void>;
    };
  }
}

export {};
