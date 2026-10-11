import type {
  RepositoryBranch,
  RepositoryChangedFile,
  RepositoryHistoryEntry,
  RepositoryRemoteBranch,
  RepositoryStash,
} from '../../../types/repository-data';

export type ManagedRepositoryRemote = {
  name: string;
  href: string;
};

export type ManagedRepository = {
  key: string;
  name: string;
  path: string;
  icon: string;
  dirtyCount: number;
  branch: string | undefined;
  commitCount: string;
  lastCommit: string;
  remotes: ManagedRepositoryRemote[];
  stagedChanges: RepositoryChangedFile[];
  unstagedChanges: RepositoryChangedFile[];
  branches: RepositoryBranch[];
  remoteBranches: RepositoryRemoteBranch[];
  stashes: RepositoryStash[];
  history: RepositoryHistoryEntry[];
  hasOverview: boolean;
  updatedAt: string | undefined;
  error: string | undefined;
};

export type RepositoryIconOption = {
  name: string;
  label: string;
};
