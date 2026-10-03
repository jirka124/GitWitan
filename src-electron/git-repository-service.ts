import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { RepositoryRemote, RepositorySummary } from '../src/types/repository-data';

const executeFile = promisify(execFile);

export class GitRepositoryService {
  async resolveRoot(folderPath: string) {
    return (await this.git(folderPath, ['rev-parse', '--show-toplevel'])).trim();
  }

  async readSummary(repositoryId: string, rootPath: string): Promise<RepositorySummary> {
    const [branch, status, remotes, commitCount, lastCommitAt] = await Promise.all([
      this.git(rootPath, ['branch', '--show-current']).then((value) => value.trim() || undefined),
      this.git(rootPath, ['status', '--porcelain=v1']).then(countChangedFiles),
      this.readRemotes(rootPath),
      this.git(rootPath, ['rev-list', '--count', 'HEAD'])
        .then((value) => Number.parseInt(value.trim(), 10))
        .catch(() => undefined),
      this.git(rootPath, ['log', '-1', '--format=%cI'])
        .then((value) => value.trim() || undefined)
        .catch(() => undefined),
    ]);

    return { repositoryId, rootPath, branch, dirtyCount: status, commitCount, lastCommitAt, remotes };
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

function countChangedFiles(statusOutput: string) {
  return statusOutput.split(/\r?\n/).filter(Boolean).length;
}
