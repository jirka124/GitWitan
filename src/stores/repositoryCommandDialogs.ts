import { defineStore } from 'pinia';

export type RepositoryRemoteOption = {
  label: string;
  value: string;
};

export type PullRemoteBranchOption = {
  label: string;
  value: string;
  remote: string;
};

export type FetchDialogPayload = {
  remote: string;
  fetchAllRemotes: boolean;
};

export type PullDialogPayload = {
  remote: string;
  remoteBranch: string;
  intoBranch: string;
};

type OpenFetchDialogOptions = {
  remotes?: RepositoryRemoteOption[];
  selectedRemote?: string;
};

type OpenPullDialogOptions = {
  remotes?: RepositoryRemoteOption[];
  remoteBranches?: PullRemoteBranchOption[];
  selectedRemote?: string;
  selectedRemoteBranch?: string;
  currentBranch?: string;
};

const defaultRemotes: RepositoryRemoteOption[] = [
  { label: 'origin', value: 'origin' },
  { label: 'upstream', value: 'upstream' },
];

const defaultPullRemoteBranches: PullRemoteBranchOption[] = [
  { label: 'main', value: 'main', remote: 'origin' },
  { label: 'develop', value: 'develop', remote: 'origin' },
  { label: 'main', value: 'main', remote: 'upstream' },
];

export const useRepositoryCommandDialogsStore = defineStore('repositoryCommandDialogs', {
  state: () => ({
    isFetchDialogOpen: false,
    fetchRemoteOptions: [...defaultRemotes] as RepositoryRemoteOption[],
    selectedFetchRemote: defaultRemotes[0]?.value ?? '',
    fetchAllRemotes: false,

    isPullDialogOpen: false,
    pullRemoteOptions: [...defaultRemotes] as RepositoryRemoteOption[],
    pullRemoteBranchOptions: [...defaultPullRemoteBranches] as PullRemoteBranchOption[],
    selectedPullRemote: defaultRemotes[0]?.value ?? '',
    selectedPullRemoteBranch: defaultPullRemoteBranches[0]?.value ?? '',
    currentBranch: 'main',
  }),

  getters: {
    selectedFetchRemoteFallback: (state) => state.fetchRemoteOptions[0]?.value ?? '',
    selectedPullRemoteFallback: (state) => state.pullRemoteOptions[0]?.value ?? '',
    availablePullRemoteBranchOptions: (state) =>
      state.pullRemoteBranchOptions.filter((branch) => branch.remote === state.selectedPullRemote),
    selectedPullRemoteBranchFallback: (state) =>
      state.pullRemoteBranchOptions.find((branch) => branch.remote === state.selectedPullRemote)
        ?.value ?? '',
  },

  actions: {
    openFetchDialog(options: OpenFetchDialogOptions = {}) {
      if (options.remotes?.length) {
        this.fetchRemoteOptions = options.remotes;
      }

      this.selectedFetchRemote =
        options.selectedRemote ?? this.selectedFetchRemote ?? this.selectedFetchRemoteFallback;

      if (!this.selectedFetchRemote) {
        this.selectedFetchRemote = this.selectedFetchRemoteFallback;
      }

      this.isFetchDialogOpen = true;
    },

    closeFetchDialog() {
      this.isFetchDialogOpen = false;
    },

    ensureSelectedFetchRemote() {
      if (!this.fetchAllRemotes && !this.selectedFetchRemote) {
        this.selectedFetchRemote = this.selectedFetchRemoteFallback;
      }
    },

    openPullDialog(options: OpenPullDialogOptions = {}) {
      if (options.remotes?.length) {
        this.pullRemoteOptions = options.remotes;
      }

      if (options.remoteBranches?.length) {
        this.pullRemoteBranchOptions = options.remoteBranches;
      }

      if (options.currentBranch) {
        this.currentBranch = options.currentBranch;
      }

      this.selectedPullRemote =
        options.selectedRemote ?? this.selectedPullRemote ?? this.selectedPullRemoteFallback;

      if (!this.selectedPullRemote) {
        this.selectedPullRemote = this.selectedPullRemoteFallback;
      }

      this.selectedPullRemoteBranch =
        options.selectedRemoteBranch ??
        this.selectedPullRemoteBranch ??
        this.selectedPullRemoteBranchFallback;

      this.ensureSelectedPullRemoteBranch();
      this.isPullDialogOpen = true;
    },

    closePullDialog() {
      this.isPullDialogOpen = false;
    },

    ensureSelectedPullRemoteBranch() {
      const branchBelongsToSelectedRemote = this.availablePullRemoteBranchOptions.some(
        (branch) => branch.value === this.selectedPullRemoteBranch,
      );

      if (!branchBelongsToSelectedRemote) {
        this.selectedPullRemoteBranch = this.selectedPullRemoteBranchFallback;
      }
    },
  },
});
