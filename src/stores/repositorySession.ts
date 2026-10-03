import { defineStore } from 'pinia';

export const useRepositorySessionStore = defineStore('repositorySession', {
  state: () => ({
    openRepositoryIds: [] as string[],
  }),

  actions: {
    open(repositoryId: string) {
      if (!this.openRepositoryIds.includes(repositoryId)) {
        this.openRepositoryIds.push(repositoryId);
      }
    },
  },
});
