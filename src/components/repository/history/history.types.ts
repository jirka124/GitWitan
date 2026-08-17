export type CommitRefType = 'local' | 'origin' | 'tag' | 'head';
export type ChangeStatus = 'modified' | 'added' | 'deleted' | 'renamed';

export type CommitRef = {
  label: string;
  type: CommitRefType;
  icon: string;
};

export type GraphSegment = {
  key: string;
  d: string;
  color: string;
};

export type CommitChange = {
  path: string;
  status: ChangeStatus;
  badge: string;
  added: number;
  removed: number;
};

export type HistoryCommit = {
  id: string;
  shortId: string;
  fullId: string;
  message: string;
  author: string;
  committer: string;
  time: string;
  committedAt: string;
  kindIcon: string;
  parents: string[];
  refs: CommitRef[];
  stats: {
    added: number;
    removed: number;
  };
  changes: CommitChange[];
};

export type RenderedHistoryCommit = HistoryCommit & {
  graph: {
    lane: number;
    color: string;
    segments: GraphSegment[];
  };
};
