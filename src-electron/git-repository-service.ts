import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  RepositoryChangeKind,
  RepositoryChangedFile,
  RepositoryRemote,
  RepositoryRemoteBranch,
  RepositoryStatus,
  RepositorySummary,
  RepositoryWorkspaceOverview,
} from '../src/types/repository-data';

const executeFile = promisify(execFile);

export class GitRepositoryService {
  async resolveRoot(folderPath: string) {
    return (await this.git(folderPath, ['rev-parse', '--show-toplevel'])).trim();
  }

  async readSummary(repositoryId: string, rootPath: string): Promise<RepositorySummary> {
    const [branch, status, remotes, commitCount, lastCommitAt] = await Promise.all([
      this.git(rootPath, ['branch', '--show-current']).then((value) => value.trim() || undefined),
      this.readStatus(repositoryId, rootPath),
      this.readRemotes(rootPath),
      this.git(rootPath, ['rev-list', '--count', 'HEAD'])
        .then((value) => Number.parseInt(value.trim(), 10))
        .catch(() => undefined),
      this.git(rootPath, ['log', '-1', '--format=%cI'])
        .then((value) => value.trim() || undefined)
        .catch(() => undefined),
    ]);

    return {
      repositoryId,
      rootPath,
      branch,
      dirtyCount: new Set([...status.staged, ...status.unstaged].map((file) => file.path)).size,
      commitCount,
      lastCommitAt,
      remotes,
    };
  }

  async readStatus(repositoryId: string, rootPath: string): Promise<RepositoryStatus> {
    return parseStatus(repositoryId, await this.git(rootPath, ['status', '--porcelain=v1']));
  }

  async readDiff(rootPath: string, filePath: string, staged: boolean) {
    return this.git(
      rootPath,
      staged ? ['diff', '--cached', '--', filePath] : ['diff', '--', filePath],
    );
  }

  async stage(rootPath: string, filePaths: string[]) {
    await this.git(rootPath, ['add', '--', ...filePaths]);
  }

  async unstage(rootPath: string, filePaths: string[]) {
    await this.git(rootPath, ['restore', '--staged', '--', ...filePaths]);
  }

  async readWorkspaceOverview(
    repositoryId: string,
    rootPath: string,
  ): Promise<RepositoryWorkspaceOverview> {
    const [branchesOutput, remoteBranchesOutput, stashesOutput, historyOutput] = await Promise.all([
      this.git(rootPath, ['for-each-ref', 'refs/heads', '--format=%(refname:short)%09%(HEAD)']),
      this.git(rootPath, ['for-each-ref', 'refs/remotes', '--format=%(refname:short)']),
      this.git(rootPath, ['stash', 'list', '--format=%gd%x09%gs']),
      this.git(rootPath, [
        'log',
        '-100',
        '--date=iso-strict',
        '--pretty=format:%H%x1f%h%x1f%P%x1f%an%x1f%cn%x1f%cI%x1f%s%x1e',
      ]).catch(() => ''),
    ]);

    return {
      repositoryId,
      branches: branchesOutput
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const [name, head] = line.split('\t');
          return { name: name ?? '', isCurrent: head === '*' };
        }),
      remoteBranches: remoteBranchesOutput
        .split(/\r?\n/)
        .map((line) => line.replace(/^refs\/remotes\//, '').replace(/^\/+/, ''))
        .filter((line) => line && !line.endsWith('/HEAD'))
        .map((line) => {
          const separatorIndex = line.indexOf('/');
          return separatorIndex > 0
            ? { remote: line.slice(0, separatorIndex), name: line.slice(separatorIndex + 1) }
            : undefined;
        })
        .filter((branch): branch is RepositoryRemoteBranch => branch !== undefined && Boolean(branch.name)),
      stashes: stashesOutput
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const [id, message] = line.split('\t');
          return { id: id ?? '', message: message ?? '' };
        }),
      history: historyOutput
        .split('\x1e')
        .filter(Boolean)
        .map((entry) => {
          const [id, shortId, parents, author, committer, committedAt, message] = entry.split('\x1f');
          return {
            id: id ?? '',
            shortId: shortId ?? '',
            parents: parents?.split(' ').filter(Boolean) ?? [],
            author: author ?? '',
            committer: committer ?? '',
            committedAt: committedAt ?? '',
            message: message ?? '',
          };
        }),
    };
  }

  private async readRemotes(rootPath: string): Promise<RepositoryRemote[]> {
    const names = (await this.git(rootPath, ['remote']))
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    return Promise.all(
      names.map(async (name) => ({
        name,
        url: (await this.git(rootPath, ['remote', 'get-url', name])).trim(),
      })),
    );
  }

  private async git(workingDirectory: string, arguments_: string[]) {
    const { stdout } = await executeFile('git', ['-C', workingDirectory, ...arguments_], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    return stdout;
  }
}

function parseStatus(repositoryId: string, output: string): RepositoryStatus {
  const staged: RepositoryChangedFile[] = [];
  const unstaged: RepositoryChangedFile[] = [];

  for (const line of output.split(/\r?\n/)) {
    if (!line || line.startsWith('!!')) continue;

    const indexStatus = line[0] ?? ' ';
    const workTreeStatus = line[1] ?? ' ';
    const filePath = line.slice(3);

    if (!filePath) continue;
    if (indexStatus !== ' ' && indexStatus !== '?') {
      staged.push({ path: filePath, kind: toChangeKind(indexStatus) });
    }
    if (workTreeStatus !== ' ') {
      unstaged.push({ path: filePath, kind: toChangeKind(workTreeStatus) });
    }
    if (indexStatus === '?' && workTreeStatus === '?') {
      unstaged.push({ path: filePath, kind: 'untracked' });
    }
  }

  return { repositoryId, staged, unstaged };
}

function toChangeKind(status: string): RepositoryChangeKind {
  if (status === 'A') return 'added';
  if (status === 'D') return 'deleted';
  if (status === 'R') return 'renamed';
  return 'modified';
}
