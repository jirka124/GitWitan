export type TrackedRepository = {
  id: string;
  path: string;
  displayName: string;
  icon: string;
  addedAt: string;
  lastOpenedAt?: string;
};

export type RepositoryRemote = {
  name: string;
  url: string;
};

export type RepositoryChangeKind = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';

export type RepositoryChangedFile = {
  path: string;
  kind: RepositoryChangeKind;
};

export type RepositoryStatus = {
  repositoryId: string;
  staged: RepositoryChangedFile[];
  unstaged: RepositoryChangedFile[];
};

export type RepositorySummary = {
  repositoryId: string;
  rootPath: string;
  branch: string | undefined;
  dirtyCount: number;
  commitCount: number | undefined;
  lastCommitAt: string | undefined;
  remotes: RepositoryRemote[];
};

export type RepositoryRecord = {
  repository: TrackedRepository;
  summary: RepositorySummary | undefined;
  error: string | undefined;
};
