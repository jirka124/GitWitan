import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { TrackedRepository } from '../src/types/repository-data';

type RegistryFile = {
  version: 1;
  repositories: TrackedRepository[];
};

export class RepositoryRegistry {
  constructor(private readonly storagePath: string) {}

  async list() {
    return (await this.read()).repositories;
  }

  async track(rootPath: string, displayName: string): Promise<TrackedRepository> {
    const registry = await this.read();
    const existing = registry.repositories.find(
      (repository) => this.normalized(repository.path) === this.normalized(rootPath),
    );

    if (existing) {
      existing.lastOpenedAt = new Date().toISOString();
      await this.write(registry);
      return existing;
    }

    const repository: TrackedRepository = {
      id: randomUUID(),
      path: rootPath,
      displayName,
      icon: 'folder_special',
      addedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
    };
    registry.repositories.unshift(repository);
    await this.write(registry);
    return repository;
  }

  private async read(): Promise<RegistryFile> {
    try {
      const parsed = JSON.parse(await readFile(this.storagePath, 'utf8')) as Partial<RegistryFile>;
      if (parsed.version === 1 && Array.isArray(parsed.repositories)) {
        return { version: 1, repositories: parsed.repositories };
      }
    } catch (error: unknown) {
      if (!this.isMissingFile(error)) {
        console.error('Unable to read GitWitan repository registry', error);
      }
    }

    return { version: 1, repositories: [] };
  }

  private async write(registry: RegistryFile) {
    await mkdir(path.dirname(this.storagePath), { recursive: true });
    const temporaryPath = `${this.storagePath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(registry, null, 2), 'utf8');
    await rename(temporaryPath, this.storagePath);
  }

  private normalized(value: string) {
    return value.replace(/\\/g, '/').replace(/\/+$/, '').toLocaleLowerCase();
  }

  private isMissingFile(error: unknown): error is NodeJS.ErrnoException {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
  }
}
