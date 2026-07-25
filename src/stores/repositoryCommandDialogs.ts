import { defineStore } from 'pinia';

export type RepositoryRemoteOption = {
  label: string;
  value: string;
};

export type RepositoryBranchOption = {
  label: string;
  value: string;
};

export type PullRemoteBranchOption = {
  label: string;
  value: string;
  remote: string;
};

export type PushDestinationBranchOption = {
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

export type PushDialogPayload = {
  sourceBranch: string;
  destinationRemote: string;
  destinationBranch: string;
  forcePush: boolean;
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

type OpenPushDialogOptions = {
  sourceBranches?: RepositoryBranchOption[];
  destinationRemotes?: RepositoryRemoteOption[];
  destinationBranches?: PushDestinationBranchOption[];
  selectedSourceBranch?: string;
  selectedDestinationRemote?: string;
  selectedDestinationBranch?: string;
};

const defaultRemotes: RepositoryRemoteOption[] = [
  { label: 'origin', value: 'origin' },
  { label: 'upstream', value: 'upstream' },
];

const defaultLocalBranches: RepositoryBranchOption[] = [
  { label: 'main', value: 'main' },
  { label: 'develop', value: 'develop' },
  { label: 'feature/repository-dialogs', value: 'feature/repository-dialogs' },
];

const defaultPullRemoteBranches: PullRemoteBranchOption[] = [
  { label: 'main', value: 'main', remote: 'origin' },
  { label: 'develop', value: 'develop', remote: 'origin' },
  { label: 'main', value: 'main', remote: 'upstream' },
];

const defaultPushDestinationBranches: PushDestinationBranchOption[] = [
  { label: 'main', value: 'main', remote: 'origin' },
  { label: 'develop', value: 'develop', remote: 'origin' },
  { label: 'feature/repository-dialogs', value: 'feature/repository-dialogs', remote: 'origin' },
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

    isPushDialogOpen: false,
    pushSourceBranchOptions: [...defaultLocalBranches] as RepositoryBranchOption[],
    pushDestinationRemoteOptions: [...defaultRemotes] as RepositoryRemoteOption[],
    pushDestinationBranchOptions: [
      ...defaultPushDestinationBranches,
    ] as PushDestinationBranchOption[],
    selectedPushSourceBranch: defaultLocalBranches[0]?.value ?? '',
    selectedPushDestinationRemote: defaultRemotes[0]?.value ?? '',
    selectedPushDestinationBranch: defaultPushDestinationBranches[0]?.value ?? '',
    forcePush: false,
  }),

  getters: {
    selectedFetchRemoteFallback: (state) => state.fetchRemoteOptions[0]?.value ?? '',
    selectedPullRemoteFallback: (state) => state.pullRemoteOptions[0]?.value ?? '',
    availablePullRemoteBranchOptions: (state) =>
      state.pullRemoteBranchOptions.filter((branch) => branch.remote === state.selectedPullRemote),
    selectedPullRemoteBranchFallback: (state) =>
      state.pullRemoteBranchOptions.find((branch) => branch.remote === state.selectedPullRemote)
        ?.value ?? '',
    selectedPushSourceBranchFallback: (state) => state.pushSourceBranchOptions[0]?.value ?? '',
    selectedPushDestinationRemoteFallback: (state) =>
      state.pushDestinationRemoteOptions[0]?.value ?? '',
    availablePushDestinationBranchOptions: (state) =>
      state.pushDestinationBranchOptions.filter(
        (branch) => branch.remote === state.selectedPushDestinationRemote,
      ),
    selectedPushDestinationBranchFallback: (state) =>
      state.pushDestinationBranchOptions.find(
        (branch) => branch.remote === state.selectedPushDestinationRemote,
      )?.value ?? '',
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

    openPushDialog(options: OpenPushDialogOptions = {}) {
      if (options.sourceBranches?.length) {
        this.pushSourceBranchOptions = options.sourceBranches;
      }

      if (options.destinationRemotes?.length) {
        this.pushDestinationRemoteOptions = options.destinationRemotes;
      }

      if (options.destinationBranches?.length) {
        this.pushDestinationBranchOptions = options.destinationBranches;
      }

      this.selectedPushSourceBranch =
        options.selectedSourceBranch ??
        this.selectedPushSourceBranch ??
        this.selectedPushSourceBranchFallback;

      if (!this.selectedPushSourceBranch) {
        this.selectedPushSourceBranch = this.selectedPushSourceBranchFallback;
      }

      this.selectedPushDestinationRemote =
        options.selectedDestinationRemote ??
        this.selectedPushDestinationRemote ??
        this.selectedPushDestinationRemoteFallback;

      if (!this.selectedPushDestinationRemote) {
        this.selectedPushDestinationRemote = this.selectedPushDestinationRemoteFallback;
      }

      this.selectedPushDestinationBranch =
        options.selectedDestinationBranch ??
        this.selectedPushDestinationBranch ??
        this.selectedPushDestinationBranchFallback;

      this.ensureSelectedPushDestinationBranch();
      this.isPushDialogOpen = true;
    },

    closePushDialog() {
      this.isPushDialogOpen = false;
    },

    ensureSelectedPushDestinationBranch() {
      const branchBelongsToSelectedRemote = this.availablePushDestinationBranchOptions.some(
        (branch) => branch.value === this.selectedPushDestinationBranch,
      );

      if (!branchBelongsToSelectedRemote) {
        this.selectedPushDestinationBranch = this.selectedPushDestinationBranchFallback;
      }
    },
  },
});
