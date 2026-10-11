import {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  shell,
  type BrowserWindowConstructorOptions,
} from 'electron';
import path from 'node:path';
import os from 'node:os';
import { registerQuasarRuntime, resolveElectronAssetsPath } from '#q-app/electron/main';
import { GitRepositoryService } from './git-repository-service';
import { RepositoryRegistry } from './repository-registry';
import { RepositorySnapshotCache } from './repository-snapshot-cache';
import type { RepositoryStatusUpdate } from '../src/types/repository-data';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
const repositoryRegistry = new RepositoryRegistry(
  path.join(app.getPath('userData'), 'repositories.json'),
);
const gitRepositoryService = new GitRepositoryService();
const repositorySnapshotCache = new RepositorySnapshotCache(
  repositoryRegistry,
  gitRepositoryService,
  (snapshot, changeKind) => {
    const channel =
      changeKind === 'status'
        ? 'gitwitan:repositories:status-changed'
        : 'gitwitan:repositories:snapshot-changed';
    const payload: RepositoryStatusUpdate | typeof snapshot =
      changeKind === 'status'
        ? {
            repositoryId: snapshot.repository.id,
            status: snapshot.status,
            dirtyCount: snapshot.summary?.dirtyCount,
            updatedAt: snapshot.updatedAt,
            error: snapshot.error,
          }
        : snapshot;
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send(channel, payload);
    }
  },
  () => BrowserWindow.getAllWindows().some((window) => window.isVisible() && !window.isMinimized()),
);

const TITLE_BAR_HEIGHT = 30;
const WINDOW_THEMES = {
  dark: {
    backgroundColor: '#151719',
    titleBarColor: '#1d2024',
    symbolColor: '#eef1f4',
  },
  light: {
    backgroundColor: '#edf0f3',
    titleBarColor: '#ffffff',
    symbolColor: '#1f252b',
  },
} as const;

type WindowTheme = keyof typeof WINDOW_THEMES;

function applyWindowTheme(window: BrowserWindow, theme: WindowTheme) {
  const colors = WINDOW_THEMES[theme];

  window.setBackgroundColor(colors.backgroundColor);

  if (platform !== 'darwin') {
    window.setTitleBarOverlay({
      color: colors.titleBarColor,
      symbolColor: colors.symbolColor,
      height: TITLE_BAR_HEIGHT,
    });
  }
}

function getTitleBarOptions(): Pick<
  BrowserWindowConstructorOptions,
  'titleBarStyle' | 'titleBarOverlay' | 'trafficLightPosition'
> {
  if (platform === 'darwin') {
    return {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 14, y: 22 },
    };
  }

  return {
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: WINDOW_THEMES.dark.titleBarColor,
      symbolColor: WINDOW_THEMES.dark.symbolColor,
      height: TITLE_BAR_HEIGHT,
    },
  };
}

async function createWindow() {
  /**
   * Initial window options
   */
  const mainWindow = new BrowserWindow({
    icon: resolveElectronAssetsPath('icons/icon.png'), // linux
    width: 1180,
    height: 760,
    minWidth: 920,
    minHeight: 560,
    useContentSize: true,
    backgroundColor: WINDOW_THEMES.dark.backgroundColor,
    ...getTitleBarOptions(),
    webPreferences: {
      contextIsolation: true,
      // https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.join(import.meta.dirname, 'electron-preload.cjs'),
    },
  });

  applyWindowTheme(mainWindow, 'dark');

  if (import.meta.env.QUASAR_DEV) {
    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  if (!import.meta.env.QUASAR_DEBUG) {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  // The cache uses a lower refresh budget while every window is hidden. Let
  // it immediately reconsider the active repository when the app returns.
  mainWindow.on('show', () => repositorySnapshotCache.onVisibilityChanged());
  mainWindow.on('restore', () => repositorySnapshotCache.onVisibilityChanged());
  mainWindow.on('hide', () => repositorySnapshotCache.onVisibilityChanged());
  mainWindow.on('minimize', () => repositorySnapshotCache.onVisibilityChanged());
}

ipcMain.handle('gitwitan:open-external-url', async (_event, url: string) => {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return;
  }

  await shell.openExternal(parsedUrl.toString());
});
ipcMain.handle('gitwitan:select-folder', async (event, defaultPath?: string) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const options = {
    title: 'Select parent folder',
    properties: ['openDirectory', 'createDirectory'] as ('openDirectory' | 'createDirectory')[],
    ...(defaultPath ? { defaultPath } : {}),
  };
  const result = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);

  return result.canceled ? undefined : result.filePaths[0];
});

ipcMain.handle('gitwitan:repositories:status', async (_event, repositoryId: string) => {
  const snapshot = await repositorySnapshotCache.snapshot(repositoryId);
  if (!snapshot) {
    throw new Error('Tracked repository was not found.');
  }
  return snapshot.status ?? { repositoryId, staged: [], unstaged: [] };
});

ipcMain.handle(
  'gitwitan:repositories:diff',
  async (_event, repositoryId: string, filePath: string, staged: boolean, untracked: boolean) => {
    const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
    if (!repository) {
      throw new Error('Tracked repository was not found.');
    }

    return gitRepositoryService.readDiff(repository.path, filePath, staged, untracked);
  },
);

ipcMain.handle(
  'gitwitan:repositories:stage',
  async (_event, repositoryId: string, filePaths: string[]) => {
    const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
    if (!repository) throw new Error('Tracked repository was not found.');
    await gitRepositoryService.stage(repository.path, filePaths);
    repositorySnapshotCache.invalidate(repositoryId);
  },
);

ipcMain.handle(
  'gitwitan:repositories:unstage',
  async (_event, repositoryId: string, filePaths: string[]) => {
    const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
    if (!repository) throw new Error('Tracked repository was not found.');
    await gitRepositoryService.unstage(repository.path, filePaths);
    repositorySnapshotCache.invalidate(repositoryId);
  },
);

ipcMain.handle('gitwitan:repositories:overview', async (_event, repositoryId: string) => {
  const snapshot = await repositorySnapshotCache.snapshot(repositoryId);
  if (!snapshot) throw new Error('Tracked repository was not found.');
  return (
    snapshot.overview ?? {
      repositoryId,
      branches: [],
      remoteBranches: [],
      stashes: [],
      history: [],
    }
  );
});

ipcMain.on('gitwitan:set-window-theme', (event, theme: WindowTheme) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (window) {
    applyWindowTheme(window, theme);
  }
});
void app.whenReady().then(async () => {
  await registerQuasarRuntime();

  void createWindow();
  void repositorySnapshotCache.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});
ipcMain.handle('gitwitan:repositories:list', async () => repositorySnapshotCache.records());
ipcMain.handle('gitwitan:repositories:bootstrap', async () => repositorySnapshotCache.snapshots());
ipcMain.handle('gitwitan:repositories:snapshot', async (_event, repositoryId: string) =>
  repositorySnapshotCache.snapshot(repositoryId),
);
ipcMain.handle('gitwitan:repositories:activate', async (_event, repositoryId: string) =>
  repositorySnapshotCache.activate(repositoryId),
);
ipcMain.handle('gitwitan:repositories:force-refresh', async (_event, repositoryId: string) => {
  // snapshot() synchronizes the registry first, so this validates against
  // persisted tracking state rather than silently accepting a stale ID.
  const snapshot = await repositorySnapshotCache.snapshot(repositoryId);
  if (!snapshot) throw new Error('Tracked repository was not found.');
  await repositorySnapshotCache.refresh(repositoryId);
  return repositorySnapshotCache.snapshot(repositoryId);
});
ipcMain.handle('gitwitan:repositories:set-open', async (_event, repositoryIds: string[]) =>
  repositorySnapshotCache.setOpenRepositoryIds(repositoryIds),
);
ipcMain.handle(
  'gitwitan:repositories:sync-session',
  async (_event, session: { openRepositoryIds: string[]; activeRepositoryId?: string }) => {
    await repositorySnapshotCache.setOpenRepositoryIds(session.openRepositoryIds);

    return session.activeRepositoryId
      ? repositorySnapshotCache.activate(session.activeRepositoryId)
      : repositorySnapshotCache.deactivate();
  },
);

ipcMain.handle(
  'gitwitan:repositories:clone',
  async (_event, repositoryUrl: string, parentFolder: string, folderName: string) => {
    const normalizedParent = path.resolve(parentFolder);
    const targetPath = path.resolve(normalizedParent, folderName);

    if (
      !folderName ||
      path.basename(folderName) !== folderName ||
      path.dirname(targetPath) !== normalizedParent
    ) {
      throw new Error('Clone folder name must be a single folder name.');
    }

    await gitRepositoryService.clone(repositoryUrl, targetPath);
    const rootPath = await gitRepositoryService.resolveRoot(targetPath);
    return repositorySnapshotCache.register(
      await repositoryRegistry.track(rootPath, path.basename(rootPath)),
    );
  },
);

ipcMain.handle('gitwitan:repositories:init', async (_event, folderPath: string) => {
  const targetPath = path.resolve(folderPath);
  await gitRepositoryService.init(targetPath);
  const rootPath = await gitRepositoryService.resolveRoot(targetPath);
  return repositorySnapshotCache.register(
    await repositoryRegistry.track(rootPath, path.basename(rootPath)),
  );
});

ipcMain.handle('gitwitan:repositories:add-existing', async (_event, folderPath: string) => {
  const rootPath = await gitRepositoryService.resolveRoot(folderPath);
  const repository = await repositoryRegistry.track(rootPath, path.basename(rootPath));
  return repositorySnapshotCache.register(repository);
});

ipcMain.handle('gitwitan:repositories:refresh', async (_event, repositoryId: string) => {
  const snapshot = await repositorySnapshotCache.snapshot(repositoryId);
  if (!snapshot) {
    throw new Error('Tracked repository was not found.');
  }
  await repositorySnapshotCache.refresh(repositoryId);
  const refreshedSnapshot = await repositorySnapshotCache.snapshot(repositoryId);
  return {
    repository: refreshedSnapshot?.repository ?? snapshot.repository,
    summary: refreshedSnapshot?.summary,
    error: refreshedSnapshot?.error,
  };
});
