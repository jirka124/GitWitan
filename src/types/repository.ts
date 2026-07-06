export type RepositoryView = 'history' | 'changes';

export type ChangeTreeNode = {
  key: string;
  label: string;
  icon: string;
  caption?: string;
  status?: 'modified' | 'added' | 'untracked';
  badge?: string;
  children?: ChangeTreeNode[];
};
