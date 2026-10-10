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


export type RepositoryBranch = {
  name: string;
  isCurrent: boolean;
};

export type RepositoryRemoteBranch = {
  remote: string;
  name: string;
};

export type RepositoryStash = {
  id: string;
  message: string;
};

export type RepositoryHistoryEntry = {
  id: string;
  shortId: string;
  parents: string[];
  author: string;
  committer: string;
  committedAt: string;
  message: string;
  body: string;
  refs: RepositoryCommitRef[];
  stats: RepositoryCommitStats;
  changes: RepositoryCommitChange[];
};

export type RepositoryCommitRef = {
  label: string;
  type: 'local' | 'origin' | 'tag' | 'head';
};

export type RepositoryCommitStats = {
  added: number;
  removed: number;
};

export type RepositoryCommitChange = {
  path: string;
  kind: Exclude<RepositoryChangeKind, 'untracked'>;
  added: number;
  removed: number;
};

export type RepositoryWorkspaceOverview = {
  repositoryId: string;
  branches: RepositoryBranch[];
  remoteBranches: RepositoryRemoteBranch[];
  stashes: RepositoryStash[];
  history: RepositoryHistoryEntry[];
};
