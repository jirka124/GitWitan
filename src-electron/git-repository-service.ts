import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  RepositoryChangeKind,
  RepositoryCommitChange,
  RepositoryCommitRef,
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

  async clone(repositoryUrl: string, targetPath: string) {
    await executeFile('git', ['clone', repositoryUrl, targetPath], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
  }

  async init(folderPath: string) {
    await executeFile('git', ['init', folderPath], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
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
    const [statusOutput, untrackedOutput] = await Promise.all([
      this.git(rootPath, ['status', '--porcelain=v1']),
      this.git(rootPath, ['ls-files', '--others', '--exclude-standard', '-z']),
    ]);

    return parseStatus(repositoryId, statusOutput, untrackedOutput.split('\0').filter(Boolean));
  }

  async readDiff(rootPath: string, filePath: string, staged: boolean, untracked: boolean) {
    if (untracked) {
      return this.gitAllowNonZeroExit(rootPath, [
        'diff',
        '--no-index',
        '--',
        '/dev/null',
        filePath,
      ]);
    }

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
    const [
      branchesOutput,
      remoteBranchesOutput,
      stashesOutput,
      historyOutput,
      refsOutput,
      headBranch,
    ] = await Promise.all([
      this.git(rootPath, ['for-each-ref', 'refs/heads', '--format=%(refname:short)%09%(HEAD)']),
      this.git(rootPath, ['for-each-ref', 'refs/remotes', '--format=%(refname:short)']),
      this.git(rootPath, ['stash', 'list', '--format=%gd%x09%gs']),
      this.git(rootPath, [
        'log',
        '--all',
        '--date-order',
        '-100',
        '--date=iso-strict',
        '--raw',
        '--numstat',
        '-M',
        '--pretty=format:%x1e%H%x1f%h%x1f%P%x1f%an%x1f%cn%x1f%cI%x1f%s%x1f%b%x1d',
      ]).catch(() => ''),
      this.git(rootPath, [
        'for-each-ref',
        '--format=%(objectname)%00%(*objectname)%00%(refname)%00',
      ]).catch(() => ''),
      this.git(rootPath, ['symbolic-ref', '--quiet', '--short', 'HEAD'])
        .then((value) => value.trim())
        .catch(() => ''),
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
        .filter(
          (branch): branch is RepositoryRemoteBranch =>
            branch !== undefined && Boolean(branch.name),
        ),
      stashes: stashesOutput
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const [id, message] = line.split('\t');
          return { id: id ?? '', message: message ?? '' };
        }),
      history: parseHistory(historyOutput, parseCommitRefs(refsOutput, headBranch)),
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

  private async gitAllowNonZeroExit(workingDirectory: string, arguments_: string[]) {
    try {
      return await this.git(workingDirectory, arguments_);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'stdout' in error) {
        const { stdout } = error as { stdout?: unknown };
        if (typeof stdout === 'string') return stdout;
      }
      throw error;
    }
  }

  private async git(workingDirectory: string, arguments_: string[]) {
    const { stdout } = await executeFile('git', ['-C', workingDirectory, ...arguments_], {
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    return stdout;
  }
}

function parseHistory(historyOutput: string, refsByCommit: Map<string, RepositoryCommitRef[]>) {
  return historyOutput
    .split('\x1e')
    .filter(Boolean)
    .map((entry) => {
      const [rawMetadata = '', diffOutput = ''] = entry.replace(/^\r?\n/, '').split('\x1d');
      const metadata = rawMetadata.replace(/^\r?\n/, '');
      const diffLines = diffOutput.split(/\r?\n/);
      const [id, shortId, parents, author, committer, committedAt, message, body] =
        metadata.split('\x1f');
      const changes = parseCommitChanges(diffLines);
      return {
        id: id ?? '',
        shortId: shortId ?? '',
        parents: parents?.split(' ').filter(Boolean) ?? [],
        author: author ?? '',
        committer: committer ?? '',
        committedAt: committedAt ?? '',
        message: message ?? '',
        body: body?.trim() ?? '',
        refs: refsByCommit.get(id ?? '') ?? [],
        stats: changes.reduce(
          (stats, change) => ({
            added: stats.added + change.added,
            removed: stats.removed + change.removed,
          }),
          { added: 0, removed: 0 },
        ),
        changes,
      };
    });
}

function parseCommitChanges(lines: string[]): RepositoryCommitChange[] {
  const kindsByPath = new Map<string, RepositoryCommitChange['kind']>();
  const changes: RepositoryCommitChange[] = [];
  for (const line of lines) {
    if (line.startsWith(':')) {
      const [rawStatus = '', ...paths] = line.split('\t');
      const path = paths.at(-1);
      if (!path) continue;
      const status = rawStatus.split(' ').at(-1)?.charAt(0);
      kindsByPath.set(
        path,
        status === 'A'
          ? 'added'
          : status === 'D'
            ? 'deleted'
            : status === 'R'
              ? 'renamed'
              : 'modified',
      );
      continue;
    }
    const [addedValue, removedValue, path] = line.split('\t');
    if (!path || !/^(\d+|-)$/.test(addedValue ?? '') || !/^(\d+|-)$/.test(removedValue ?? ''))
      continue;
    changes.push({
      path,
      kind: kindsByPath.get(path) ?? 'modified',
      added: Number.parseInt(addedValue ?? '0', 10) || 0,
      removed: Number.parseInt(removedValue ?? '0', 10) || 0,
    });
  }
  return changes;
}

function parseCommitRefs(refsOutput: string, headBranch: string) {
  const refsByCommit = new Map<string, RepositoryCommitRef[]>();
  const fields = refsOutput.split('\0');

  for (let index = 0; index + 2 < fields.length; index += 3) {
    const id = fields[index]?.trim() ?? '';
    const peeledId = fields[index + 1]?.trim() ?? '';
    const refName = fields[index + 2]?.trim() ?? '';
    if (!id || !refName) continue;
    const ref = toCommitRef(refName, headBranch);
    if (!ref) continue;
    const commitId = peeledId || id;
    const refs = refsByCommit.get(commitId) ?? [];
    refs.push(ref);
    refsByCommit.set(commitId, refs);
  }
  return refsByCommit;
}

function toCommitRef(refName: string, headBranch: string): RepositoryCommitRef | undefined {
  if (refName.startsWith('refs/heads/')) {
    const label = refName.slice('refs/heads/'.length);
    return { label, type: label === headBranch ? 'head' : 'local' };
  }
  if (refName.startsWith('refs/remotes/') && !refName.endsWith('/HEAD'))
    return { label: refName.slice('refs/remotes/'.length), type: 'origin' };
  if (refName.startsWith('refs/tags/'))
    return { label: refName.slice('refs/tags/'.length), type: 'tag' };
  return undefined;
}
function parseStatus(
  repositoryId: string,
  output: string,
  untrackedPaths: string[],
): RepositoryStatus {
  const staged: RepositoryChangedFile[] = [];
  const unstaged: RepositoryChangedFile[] = [];

  for (const line of output.split(/\r?\n/)) {
    if (!line || line.startsWith('!!')) continue;

    const indexStatus = line[0] ?? ' ';
    const workTreeStatus = line[1] ?? ' ';
    const filePath = line.slice(3);

    if (!filePath) continue;
    if (indexStatus === '?' && workTreeStatus === '?') continue;

    if (indexStatus !== ' ' && indexStatus !== '?') {
      staged.push({ path: filePath, kind: toChangeKind(indexStatus) });
    }
    if (workTreeStatus !== ' ') {
      unstaged.push({ path: filePath, kind: toChangeKind(workTreeStatus) });
    }
  }

  for (const path of untrackedPaths) {
    unstaged.push({ path, kind: 'untracked' });
  }

  return { repositoryId, staged, unstaged };
}

function toChangeKind(status: string): RepositoryChangeKind {
  if (status === 'A') return 'added';
  if (status === 'D') return 'deleted';
  if (status === 'R') return 'renamed';
  return 'modified';
}
