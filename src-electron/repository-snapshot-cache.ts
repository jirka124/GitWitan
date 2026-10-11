import { watch, type FSWatcher } from 'node:fs';
import path from 'node:path';
import type {
  RepositoryRecord,
  RepositorySnapshot,
  TrackedRepository,
} from '../src/types/repository-data';
import type { GitRepositoryService } from './git-repository-service';
import type { RepositoryRegistry } from './repository-registry';

type CacheEntry = RepositorySnapshot & {
  refreshPromise: Promise<void> | undefined;
  statusRefreshPromise: Promise<void> | undefined;
  refreshTimer: NodeJS.Timeout | undefined;
  metadataDirty: boolean;
  metadataWatchers: FSWatcher[];
  metadataWatchRetryTimer: NodeJS.Timeout | undefined;
  metadataWatchStableTimer: NodeJS.Timeout | undefined;
  metadataWatchRetryCount: number;
  watchToken: number;
  metadataWatchStarting: boolean;
  worktreeWatcher: FSWatcher | undefined;
  worktreeWatchToken: number;
  statusDirty: boolean;
  statusCooldownTimer: NodeJS.Timeout | undefined;
  fallbackRefreshTimer: NodeJS.Timeout | undefined;
  statusUpdatedAt: number | undefined;
  metadataUpdatedAt: number | undefined;
  generation: number;
};

/**
 * Keeps expensive Git reads off the route-change path.  Entries are returned
 * immediately and refreshed in the background; a single refresh is shared by
 * all callers for a repository.
 */
export class RepositorySnapshotCache {
  private readonly entries = new Map<string, CacheEntry>();
  private activeRepositoryId: string | undefined;
  private openRepositoryIds = new Set<string>();
  private readonly warmupQueue: string[] = [];
  private warmupTimer: NodeJS.Timeout | undefined;
  private warmupInProgress = false;

  constructor(
    private readonly registry: RepositoryRegistry,
    private readonly git: GitRepositoryService,
    private readonly onChanged: (
      snapshot: RepositorySnapshot,
      changeKind: 'status' | 'snapshot',
    ) => void,
    private readonly isAppVisible: () => boolean,
  ) {}

  async start() {
    await this.syncRegistry();
  }

  stop() {
    if (this.warmupTimer) clearTimeout(this.warmupTimer);
    this.warmupTimer = undefined;
    this.warmupQueue.length = 0;
    for (const entry of this.entries.values()) this.closeEntry(entry);
    this.entries.clear();
  }

  onVisibilityChanged() {
    for (const repositoryId of this.openRepositoryIds) {
      const entry = this.entries.get(repositoryId);
      if (!entry) continue;
      this.resetFallbackRefreshTimer(entry);
      this.reprioritizeStatusCooldown(entry);
      if (
        this.isAppVisible() &&
        entry.repository.id === this.activeRepositoryId &&
        (!entry.statusUpdatedAt || Date.now() - entry.statusUpdatedAt > 5_000 || entry.statusDirty)
      ) {
        this.requestStatusRefresh(entry);
      }
    }
  }

  deactivate() {
    const previous = this.activeRepositoryId
      ? this.entries.get(this.activeRepositoryId)
      : undefined;
    this.activeRepositoryId = undefined;
    if (previous && this.openRepositoryIds.has(previous.repository.id)) {
      this.resetFallbackRefreshTimer(previous);
      this.reprioritizeStatusCooldown(previous);
    }
  }

  async snapshots() {
    await this.syncRegistry();
    return [...this.entries.values()].map((entry) => this.toSnapshot(entry));
  }

  async snapshot(repositoryId: string) {
    await this.syncRegistry();
    const entry = this.entries.get(repositoryId);
    if (!entry) return undefined;
    return this.toSnapshot(entry);
  }

  async activate(repositoryId: string) {
    await this.syncRegistry();
    const entry = this.entries.get(repositoryId);
    if (!entry) return undefined;

    const hasChangedActiveRepository = this.activeRepositoryId !== repositoryId;
    if (hasChangedActiveRepository) {
      const previous = this.activeRepositoryId
        ? this.entries.get(this.activeRepositoryId)
        : undefined;
      this.activeRepositoryId = repositoryId;
      if (previous && this.openRepositoryIds.has(previous.repository.id)) {
        this.configureGitMetadataWatch(previous);
        this.resetFallbackRefreshTimer(previous);
        this.reprioritizeStatusCooldown(previous);
      }
    }
    // Activation may arrive just before the renderer synchronises its tab
    // list. Keep this repository in the open set during that small gap.
    this.openRepositoryIds.add(repositoryId);
    this.configureGitMetadataWatch(entry);
    this.startWorktreeWatch(entry);
    this.resetFallbackRefreshTimer(entry);
    this.reprioritizeStatusCooldown(entry);

    if (!entry.overview) {
      void this.refresh(repositoryId);
    } else if (!entry.metadataUpdatedAt || Date.now() - entry.metadataUpdatedAt > 30_000) {
      void this.refresh(repositoryId);
    } else if (!entry.statusUpdatedAt || Date.now() - entry.statusUpdatedAt > 5_000) {
      void this.refreshStatus(repositoryId);
    }
    return this.toSnapshot(entry);
  }

  async setOpenRepositoryIds(repositoryIds: string[]) {
    await this.syncRegistry();
    const nextOpenRepositoryIds = new Set(
      repositoryIds.filter((repositoryId) => this.entries.has(repositoryId)),
    );

    for (const repositoryId of this.openRepositoryIds) {
      if (!nextOpenRepositoryIds.has(repositoryId)) {
        const entry = this.entries.get(repositoryId);
        if (entry) this.stopWatching(entry);
      }
    }

    // A closed tab must not retain active priority. It also ensures a late
    // resolveGitDirectory result cannot restart metadata watching for it.
    if (this.activeRepositoryId && !nextOpenRepositoryIds.has(this.activeRepositoryId)) {
      this.activeRepositoryId = undefined;
    }

    this.openRepositoryIds = nextOpenRepositoryIds;
    for (const repositoryId of this.openRepositoryIds) {
      const entry = this.entries.get(repositoryId);
      if (entry) {
        this.configureGitMetadataWatch(entry);
        this.startWorktreeWatch(entry);
        this.resetFallbackRefreshTimer(entry);
        if (repositoryId !== this.activeRepositoryId && !entry.overview) {
          this.enqueueWarmup(repositoryId);
        }
      }
    }
  }

  async records(): Promise<RepositoryRecord[]> {
    return (await this.snapshots()).map((snapshot) => ({
      repository: snapshot.repository,
      summary: snapshot.summary,
      error: snapshot.error,
    }));
  }

  register(repository: TrackedRepository) {
    const entry = this.ensureEntry(repository);
    void this.refresh(repository.id);
    return this.toRecord(entry);
  }

  refresh(repositoryId: string) {
    const entry = this.entries.get(repositoryId);
    if (!entry) return Promise.resolve();
    if (entry.refreshPromise) return entry.refreshPromise;

    const generation = entry.generation;
    const repository = entry.repository;
    const refreshPromise = (async () => {
      try {
        // A status-only pass may already be in flight when a metadata or
        // fallback refresh is requested. Let it finish first so Git never
        // scans the worktree concurrently for the same repository.
        await entry.statusRefreshPromise;
        const [status, overview] = await Promise.all([
          this.git.readStatus(repository.id, repository.path),
          this.git.readWorkspaceOverview(repository.id, repository.path),
        ]);
        const summary = await this.git.readSummary(repository.id, repository.path, status);
        if (!this.isCurrentEntry(entry, generation)) return;
        entry.summary = summary;
        entry.status = status;
        entry.overview = overview;
        entry.updatedAt = new Date().toISOString();
        entry.statusUpdatedAt = Date.now();
        entry.metadataUpdatedAt = entry.statusUpdatedAt;
        entry.error = undefined;
      } catch (error: unknown) {
        if (this.isCurrentEntry(entry, generation)) {
          entry.error = error instanceof Error ? error.message : 'Unable to inspect repository.';
        }
      } finally {
        entry.refreshPromise = undefined;
        if (this.isCurrentEntry(entry, generation)) {
          this.onStatusRefreshComplete(entry);
          this.emit(entry, 'snapshot');
          if (entry.metadataDirty) {
            entry.metadataDirty = false;
            void this.refresh(entry.repository.id);
          }
        }
      }
    })();
    entry.refreshPromise = refreshPromise;
    return refreshPromise;
  }

  invalidate(repositoryId: string) {
    const entry = this.entries.get(repositoryId);
    if (!entry) return;
    entry.metadataDirty = true;
    if (entry.refreshTimer) clearTimeout(entry.refreshTimer);
    entry.refreshTimer = setTimeout(() => {
      entry.refreshTimer = undefined;
      // A metadata event received while another full refresh is running must
      // survive until that refresh completes; otherwise its newer refs can be
      // silently missed.
      if (entry.refreshPromise) return;
      entry.metadataDirty = false;
      void this.refresh(repositoryId);
    }, 300);
  }

  invalidateStatus(repositoryId: string) {
    const entry = this.entries.get(repositoryId);
    if (!entry) return;
    this.requestStatusRefresh(entry);
  }

  private refreshStatus(repositoryId: string) {
    const entry = this.entries.get(repositoryId);
    if (!entry || entry.refreshPromise || entry.statusRefreshPromise) return Promise.resolve();
    const generation = entry.generation;
    const repository = entry.repository;
    const statusRefreshPromise = (async () => {
      try {
        const status = await this.git.readStatus(repository.id, repository.path);
        if (!this.isCurrentEntry(entry, generation)) return;
        entry.status = status;
        if (entry.summary) {
          entry.summary = {
            ...entry.summary,
            dirtyCount: new Set([...status.staged, ...status.unstaged].map((file) => file.path))
              .size,
          };
        }
        entry.updatedAt = new Date().toISOString();
        entry.statusUpdatedAt = Date.now();
        entry.error = undefined;
      } catch (error: unknown) {
        if (this.isCurrentEntry(entry, generation)) {
          entry.error = error instanceof Error ? error.message : 'Unable to inspect repository.';
        }
      } finally {
        entry.statusRefreshPromise = undefined;
        if (this.isCurrentEntry(entry, generation)) {
          this.onStatusRefreshComplete(entry);
          this.emit(entry, 'status');
        }
      }
    })();
    entry.statusRefreshPromise = statusRefreshPromise;
    return statusRefreshPromise;
  }

  private async syncRegistry() {
    const repositories = await this.registry.list();
    const ids = new Set(repositories.map((repository) => repository.id));
    for (const repository of repositories) this.ensureEntry(repository);
    for (const [id, entry] of this.entries) {
      if (!ids.has(id)) {
        this.closeEntry(entry);
        this.entries.delete(id);
        if (this.activeRepositoryId === id) this.activeRepositoryId = undefined;
      }
    }
  }

  private ensureEntry(repository: TrackedRepository) {
    const existing = this.entries.get(repository.id);
    if (existing) {
      if (existing.repository.path !== repository.path) {
        this.stopWatching(existing);
        existing.generation += 1;
        existing.refreshPromise = undefined;
        existing.statusRefreshPromise = undefined;
        existing.summary = undefined;
        existing.status = undefined;
        existing.overview = undefined;
        existing.updatedAt = undefined;
        existing.statusUpdatedAt = undefined;
        existing.metadataUpdatedAt = undefined;
        existing.error = undefined;
      }
      existing.repository = repository;
      return existing;
    }
    const entry: CacheEntry = {
      repository,
      summary: undefined,
      status: undefined,
      overview: undefined,
      updatedAt: undefined,
      error: undefined,
      metadataWatchers: [],
      metadataWatchRetryTimer: undefined,
      metadataWatchStableTimer: undefined,
      metadataWatchRetryCount: 0,
      watchToken: 0,
      metadataWatchStarting: false,
      worktreeWatcher: undefined,
      worktreeWatchToken: 0,
      statusDirty: false,
      statusCooldownTimer: undefined,
      fallbackRefreshTimer: undefined,
      refreshPromise: undefined,
      statusRefreshPromise: undefined,
      refreshTimer: undefined,
      metadataDirty: false,
      statusUpdatedAt: undefined,
      metadataUpdatedAt: undefined,
      generation: 0,
    };
    this.entries.set(repository.id, entry);
    return entry;
  }

  private configureGitMetadataWatch(entry: CacheEntry) {
    if (entry.metadataWatchers.length > 0 || entry.metadataWatchStarting) return;
    this.stopGitMetadataWatch(entry);
    const watchToken = ++entry.watchToken;
    entry.metadataWatchStarting = true;
    void this.watchGitMetadata(entry, watchToken);
  }

  private async watchGitMetadata(entry: CacheEntry, watchToken: number) {
    try {
      const [gitDirectory, gitCommonDirectory] = await Promise.all([
        this.git.resolveGitDirectory(entry.repository.path),
        this.git.resolveGitCommonDirectory(entry.repository.path),
      ]);
      if (
        this.entries.get(entry.repository.id) !== entry ||
        !this.openRepositoryIds.has(entry.repository.id) ||
        entry.watchToken !== watchToken
      )
        return;

      // Git often atomically replaces metadata files, so a watcher attached
      // directly to HEAD or packed-refs can remain on the old inode. Watch
      // only the relevant directories instead. Linked worktrees keep HEAD in
      // their private Git directory, while refs and packed-refs live in the
      // shared common directory.
      // Index, lock and object traffic is never watched.
      if (
        !this.addMetadataWatch(entry, gitDirectory, false, watchToken, (filename) => {
          const name = filename.toString().replace(/\\/g, '/');
          return name === 'HEAD' || (gitDirectory === gitCommonDirectory && name === 'packed-refs');
        })
      )
        return;
      if (gitDirectory !== gitCommonDirectory) {
        if (
          !this.addMetadataWatch(
            entry,
            gitCommonDirectory,
            false,
            watchToken,
            (filename) => filename.toString().replace(/\\/g, '/') === 'packed-refs',
          )
        )
          return;
      }
      if (
        !this.addMetadataWatch(
          entry,
          path.join(gitCommonDirectory, 'refs'),
          true,
          watchToken,
          () => true,
        )
      )
        return;
      this.resetMetadataWatchRetryAfterStablePeriod(entry, watchToken);
    } catch {
      // A worktree can briefly be in flux while Git rewrites its metadata.
      // Retry rather than silently losing ref notifications until fallback.
      this.recoverMetadataWatch(entry, watchToken);
    } finally {
      if (entry.watchToken === watchToken) entry.metadataWatchStarting = false;
    }
  }

  private closeEntry(entry: CacheEntry) {
    if (entry.refreshTimer) clearTimeout(entry.refreshTimer);
    if (entry.metadataWatchRetryTimer) clearTimeout(entry.metadataWatchRetryTimer);
    if (entry.metadataWatchStableTimer) clearTimeout(entry.metadataWatchStableTimer);
    this.stopWatching(entry);
  }

  private stopWatching(entry: CacheEntry) {
    this.stopGitMetadataWatch(entry);
    entry.worktreeWatcher?.close();
    entry.worktreeWatcher = undefined;
    entry.worktreeWatchToken += 1;
    if (entry.statusCooldownTimer) clearTimeout(entry.statusCooldownTimer);
    if (entry.fallbackRefreshTimer) clearTimeout(entry.fallbackRefreshTimer);
    entry.statusCooldownTimer = undefined;
    entry.fallbackRefreshTimer = undefined;
    entry.statusDirty = false;
    entry.metadataDirty = false;
    if (entry.refreshTimer) clearTimeout(entry.refreshTimer);
    entry.refreshTimer = undefined;
  }

  private stopGitMetadataWatch(entry: CacheEntry) {
    entry.watchToken += 1;
    entry.metadataWatchStarting = false;
    if (entry.metadataWatchRetryTimer) clearTimeout(entry.metadataWatchRetryTimer);
    if (entry.metadataWatchStableTimer) clearTimeout(entry.metadataWatchStableTimer);
    entry.metadataWatchRetryTimer = undefined;
    entry.metadataWatchStableTimer = undefined;
    for (const watcher of entry.metadataWatchers) watcher.close();
    entry.metadataWatchers = [];
  }

  private addMetadataWatch(
    entry: CacheEntry,
    targetPath: string,
    recursive: boolean,
    watchToken: number,
    accepts: (filename: string | Buffer) => boolean,
  ) {
    try {
      const watcher = watch(targetPath, { recursive }, (_eventType, filename) => {
        if (
          !filename ||
          this.entries.get(entry.repository.id) !== entry ||
          !this.openRepositoryIds.has(entry.repository.id) ||
          entry.watchToken !== watchToken ||
          !accepts(filename)
        ) {
          return;
        }
        this.invalidate(entry.repository.id);
      });
      watcher.on('error', () => {
        watcher.close();
        this.recoverMetadataWatch(entry, watchToken);
      });
      watcher.unref();
      entry.metadataWatchers.push(watcher);
      return true;
    } catch {
      // A filesystem may not support this watcher. The periodic full refresh
      // below remains the correctness fallback.
      this.recoverMetadataWatch(entry, watchToken);
      return false;
    }
  }

  private recoverMetadataWatch(entry: CacheEntry, watchToken: number) {
    if (
      this.entries.get(entry.repository.id) !== entry ||
      !this.openRepositoryIds.has(entry.repository.id) ||
      entry.watchToken !== watchToken ||
      entry.metadataWatchRetryTimer
    ) {
      return;
    }
    // Recursive watch support can be permanently unavailable (network
    // shares and some virtual filesystems are common examples). Retrying
    // forever turns that unsupported capability into periodic background
    // work, while the full-refresh fallback already preserves correctness.
    if (entry.metadataWatchRetryCount >= 5) return;
    entry.metadataWatchRetryCount += 1;
    const retryDelayMs = Math.min(10_000 * 2 ** (entry.metadataWatchRetryCount - 1), 120_000);
    this.stopGitMetadataWatch(entry);
    entry.metadataWatchRetryTimer = setTimeout(() => {
      entry.metadataWatchRetryTimer = undefined;
      if (
        this.entries.get(entry.repository.id) === entry &&
        this.openRepositoryIds.has(entry.repository.id)
      ) {
        this.configureGitMetadataWatch(entry);
      }
    }, retryDelayMs);
    entry.metadataWatchRetryTimer.unref();
  }

  private resetMetadataWatchRetryAfterStablePeriod(entry: CacheEntry, watchToken: number) {
    if (entry.metadataWatchStableTimer) clearTimeout(entry.metadataWatchStableTimer);
    entry.metadataWatchStableTimer = setTimeout(() => {
      entry.metadataWatchStableTimer = undefined;
      if (entry.watchToken === watchToken && entry.metadataWatchers.length > 0) {
        entry.metadataWatchRetryCount = 0;
      }
    }, 60_000);
    entry.metadataWatchStableTimer.unref();
  }

  /**
   * Watches only the worktree. Git writes into its own metadata directory
   * while calculating status, so events from .git must never feed this
   * scheduler or a status refresh can trigger itself indefinitely.
   */
  private startWorktreeWatch(entry: CacheEntry) {
    if (entry.worktreeWatcher) return;
    try {
      const worktreeWatchToken = ++entry.worktreeWatchToken;
      entry.worktreeWatcher = watch(
        entry.repository.path,
        { recursive: true },
        (_eventType, filename) => {
          if (
            !filename ||
            entry.worktreeWatchToken !== worktreeWatchToken ||
            !this.isCurrentEntry(entry) ||
            this.isGitMetadataPath(filename)
          )
            return;
          this.requestStatusRefresh(entry);
        },
      );
      entry.worktreeWatcher.on('error', () => {
        if (entry.worktreeWatchToken !== worktreeWatchToken) return;
        entry.worktreeWatcher?.close();
        entry.worktreeWatcher = undefined;
      });
      this.resetFallbackRefreshTimer(entry);
    } catch {
      // The fallback timer still keeps repositories on filesystems that do
      // not support recursive watching reasonably fresh.
      this.resetFallbackRefreshTimer(entry);
    }
  }

  private isGitMetadataPath(filename: string | Buffer) {
    return filename
      .toString()
      .split(/[\\/]+/)
      .some((segment) => segment === '.git');
  }

  /**
   * Leading/coalescing status scheduler. The first event refreshes
   * immediately; during a status run or cooldown, later events only record
   * that another pass is needed. This bounds a busy worktree to one Git
   * status per cooldown interval without delaying the first visible change.
   */
  private requestStatusRefresh(entry: CacheEntry) {
    if (!this.openRepositoryIds.has(entry.repository.id)) return;
    entry.statusDirty = true;
    if (entry.refreshPromise || entry.statusRefreshPromise || entry.statusCooldownTimer) return;
    // Do not keep a hidden application hot just because its worktree is
    // changing. The dirty marker preserves the latest state for one delayed
    // pass, and visibility restores the fast active-repository path.
    if (!this.isAppVisible()) {
      this.scheduleStatusCooldown(entry);
      return;
    }
    this.runScheduledStatusRefresh(entry);
  }

  private runScheduledStatusRefresh(entry: CacheEntry) {
    if (!entry.statusDirty || entry.refreshPromise || entry.statusRefreshPromise) return;
    entry.statusDirty = false;
    void this.refreshStatus(entry.repository.id);
  }

  private onStatusRefreshComplete(entry: CacheEntry) {
    if (!this.openRepositoryIds.has(entry.repository.id)) return;
    this.resetFallbackRefreshTimer(entry);
    if (entry.statusCooldownTimer) clearTimeout(entry.statusCooldownTimer);
    this.scheduleStatusCooldown(entry);
  }

  private scheduleStatusCooldown(entry: CacheEntry) {
    entry.statusCooldownTimer = setTimeout(() => {
      entry.statusCooldownTimer = undefined;
      this.runScheduledStatusRefresh(entry);
    }, this.statusCooldownMs(entry));
    entry.statusCooldownTimer.unref();
  }

  /** Re-arm a pending cooldown when tab priority or app visibility changes. */
  private reprioritizeStatusCooldown(entry: CacheEntry) {
    if (!entry.statusCooldownTimer) return;
    clearTimeout(entry.statusCooldownTimer);
    entry.statusCooldownTimer = undefined;
    if (
      entry.statusDirty &&
      entry.repository.id === this.activeRepositoryId &&
      this.isAppVisible()
    ) {
      this.runScheduledStatusRefresh(entry);
      return;
    }
    this.scheduleStatusCooldown(entry);
  }

  private resetFallbackRefreshTimer(entry: CacheEntry) {
    if (!this.openRepositoryIds.has(entry.repository.id)) return;
    if (entry.fallbackRefreshTimer) clearTimeout(entry.fallbackRefreshTimer);
    entry.fallbackRefreshTimer = setTimeout(() => {
      entry.fallbackRefreshTimer = undefined;
      void this.refresh(entry.repository.id);
    }, this.fallbackRefreshMs(entry));
    entry.fallbackRefreshTimer.unref();
  }

  private statusCooldownMs(entry: CacheEntry) {
    return entry.repository.id === this.activeRepositoryId && this.isAppVisible() ? 500 : 5_000;
  }

  private enqueueWarmup(repositoryId: string) {
    if (!this.openRepositoryIds.has(repositoryId) || repositoryId === this.activeRepositoryId)
      return;
    if (!this.warmupQueue.includes(repositoryId)) this.warmupQueue.push(repositoryId);
    this.scheduleWarmup();
  }

  private scheduleWarmup(delayMs = 200) {
    if (this.warmupInProgress || this.warmupTimer || this.warmupQueue.length === 0) return;
    this.warmupTimer = setTimeout(() => {
      this.warmupTimer = undefined;
      void this.runNextWarmup();
    }, delayMs);
    this.warmupTimer.unref();
  }

  private async runNextWarmup() {
    if (this.warmupInProgress) return;
    const repositoryId = this.warmupQueue.shift();
    if (!repositoryId) return;
    this.warmupInProgress = true;
    try {
      const entry = this.entries.get(repositoryId);
      if (
        entry &&
        this.openRepositoryIds.has(repositoryId) &&
        repositoryId !== this.activeRepositoryId &&
        !entry.overview
      ) {
        await this.refresh(repositoryId);
      }
    } finally {
      this.warmupInProgress = false;
      this.scheduleWarmup();
    }
  }

  private fallbackRefreshMs(entry: CacheEntry) {
    const base =
      entry.repository.id === this.activeRepositoryId && this.isAppVisible() ? 30_000 : 180_000;
    // Stable per-repository jitter prevents tabs opened together from all
    // starting an expensive metadata/history refresh in the same tick.
    return base + (this.repositoryHash(entry.repository.id) % Math.round(base * 0.15));
  }

  private repositoryHash(value: string) {
    let hash = 0;
    for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return hash;
  }

  private isCurrentEntry(entry: CacheEntry, generation?: number) {
    return (
      this.entries.get(entry.repository.id) === entry &&
      (generation === undefined || entry.generation === generation)
    );
  }

  private emit(entry: CacheEntry, changeKind: 'status' | 'snapshot') {
    if (!this.isCurrentEntry(entry)) return;
    this.onChanged(this.toSnapshot(entry), changeKind);
  }

  private toSnapshot(entry: CacheEntry): RepositorySnapshot {
    return {
      repository: entry.repository,
      summary: entry.summary,
      status: entry.status,
      overview: entry.overview,
      updatedAt: entry.updatedAt,
      error: entry.error,
    };
  }

  private toRecord(entry: CacheEntry): RepositoryRecord {
    return { repository: entry.repository, summary: entry.summary, error: entry.error };
  }
}
