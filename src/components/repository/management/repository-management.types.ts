export type ManagedRepositoryRemoteTone = 'ok' | 'warning' | 'stale';

export type ManagedRepositoryRemote = {
  name: string;
  href: string;
  status: string;
  tone: ManagedRepositoryRemoteTone;
  lastFetch: string;
};

export type ManagedRepository = {
  key: string;
  name: string;
  path: string;
  icon: string;
  dirtyCount: number;
  lastFetch: string;
  commitCount: string;
  lastCommit: string;
  remotes: ManagedRepositoryRemote[];
};

export type RepositoryIconOption = {
  name: string;
  label: string;
};
