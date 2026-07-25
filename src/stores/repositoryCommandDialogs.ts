import { defineStore } from 'pinia';

export type FetchRemoteOption = {
  label: string;
  value: string;
};

export type FetchDialogPayload = {
  remote: string;
  fetchAllRemotes: boolean;
};

type OpenFetchDialogOptions = {
  remotes?: FetchRemoteOption[];
  selectedRemote?: string;
};

const defaultFetchRemotes: FetchRemoteOption[] = [
  { label: 'origin', value: 'origin' },
  { label: 'upstream', value: 'upstream' },
];

export const useRepositoryCommandDialogsStore = defineStore('repositoryCommandDialogs', {
  state: () => ({
    isFetchDialogOpen: false,
    fetchRemoteOptions: [...defaultFetchRemotes] as FetchRemoteOption[],
    selectedFetchRemote: defaultFetchRemotes[0]?.value ?? '',
    fetchAllRemotes: false,
  }),

  getters: {
    selectedRemoteFallback: (state) => state.fetchRemoteOptions[0]?.value ?? '',
  },

  actions: {
    openFetchDialog(options: OpenFetchDialogOptions = {}) {
      if (options.remotes?.length) {
        this.fetchRemoteOptions = options.remotes;
      }

      this.selectedFetchRemote =
        options.selectedRemote ?? this.selectedFetchRemote ?? this.selectedRemoteFallback;

      if (!this.selectedFetchRemote) {
        this.selectedFetchRemote = this.selectedRemoteFallback;
      }

      this.isFetchDialogOpen = true;
    },

    closeFetchDialog() {
      this.isFetchDialogOpen = false;
    },

    ensureSelectedFetchRemote() {
      if (!this.fetchAllRemotes && !this.selectedFetchRemote) {
        this.selectedFetchRemote = this.selectedRemoteFallback;
      }
    },
  },
});
