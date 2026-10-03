import { defineStore } from 'pinia';
import type { ChangeTreeNode } from '../types/repository';
import type { RepositoryChangedFile } from '../types/repository-data';

const toTree = (files: RepositoryChangedFile[], area: 'staged' | 'unstaged'): ChangeTreeNode[] =>
  files.map((file) => ({
    key: `${area}:${file.path}`,
    label: file.path.split('/').at(-1) ?? file.path,
    caption: file.path,
    icon: 'description',
    status: file.kind,
    badge:
      file.kind === 'modified'
        ? 'M'
        : file.kind === 'added'
          ? 'A'
          : file.kind === 'deleted'
            ? 'D'
            : file.kind === 'renamed'
              ? 'R'
              : 'U',
  }));

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
  },
});
