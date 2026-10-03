import { defineStore } from 'pinia';
import type { ChangeTreeNode } from '../types/repository';
import type { RepositoryChangedFile } from '../types/repository-data';

const statusBadge = (kind: RepositoryChangedFile['kind']) =>
  kind === 'modified'
    ? 'M'
    : kind === 'added'
      ? 'A'
      : kind === 'deleted'
        ? 'D'
        : kind === 'renamed'
          ? 'R'
          : 'U';

const toTree = (files: RepositoryChangedFile[], area: 'staged' | 'unstaged'): ChangeTreeNode[] => {
  const roots: ChangeTreeNode[] = [];
  const folders = new Map<string, ChangeTreeNode>();

  for (const file of files) {
    const path = file.path.replace(/\\/g, '/');
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop();

    if (!fileName) continue;

    let children = roots;
    let folderPath = '';

    for (const folderName of segments) {
      folderPath = folderPath ? `${folderPath}/${folderName}` : folderName;
      const folderKey = `${area}:folder:${folderPath}`;
      let folder = folders.get(folderKey);

      if (!folder) {
        folder = {
          key: folderKey,
          label: folderName,
          icon: 'folder',
          children: [],
        };
        folders.set(folderKey, folder);
        children.push(folder);
      }

      children = folder.children as ChangeTreeNode[];
    }

    children.push({
      key: `${area}:file:${path}`,
      label: fileName,
      caption: path,
      icon: 'description',
      status: file.kind,
      badge: statusBadge(file.kind),
    });
  }

  return roots;
};

export const useRepositoryWorkspaceStore = defineStore('repositoryWorkspace', {
  state: () => ({
    repositoryId: undefined as string | undefined,
    stagedTree: [] as ChangeTreeNode[],
    unstagedTree: [] as ChangeTreeNode[],
    isLoading: false,
    error: undefined as string | undefined,
  }),

  actions: {
    async load(repositoryId: string) {
      if (!window.gitwitanRepositories) return;

      this.repositoryId = repositoryId;
      this.isLoading = true;
      this.error = undefined;
      try {
        const status = await window.gitwitanRepositories.status(repositoryId);
        if (this.repositoryId !== repositoryId) return;

        this.stagedTree = toTree(status.staged, 'staged');
        this.unstagedTree = toTree(status.unstaged, 'unstaged');
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Unable to load repository status.';
      } finally {
        if (this.repositoryId === repositoryId) this.isLoading = false;
      }
    },

    async stage(repositoryId: string, filePaths: string[]) {
      await this.runChangeAction(repositoryId, filePaths, 'stage');
    },

    async unstage(repositoryId: string, filePaths: string[]) {
      await this.runChangeAction(repositoryId, filePaths, 'unstage');
    },

    async runChangeAction(repositoryId: string, filePaths: string[], action: 'stage' | 'unstage') {
      if (!window.gitwitanRepositories) return;

      this.isLoading = true;
      this.error = undefined;
      try {
        if (action === 'stage') await window.gitwitanRepositories.stage(repositoryId, filePaths);
        else await window.gitwitanRepositories.unstage(repositoryId, filePaths);

        await this.load(repositoryId);
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : `Unable to ${action} files.`;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
