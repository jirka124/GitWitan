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

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

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
  const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
  if (!repository) {
    throw new Error('Tracked repository was not found.');
  }

  return gitRepositoryService.readStatus(repositoryId, repository.path);
});

ipcMain.handle(
  'gitwitan:repositories:diff',
  async (_event, repositoryId: string, filePath: string, staged: boolean) => {
    const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
    if (!repository) {
      throw new Error('Tracked repository was not found.');
    }

    return gitRepositoryService.readDiff(repository.path, filePath, staged);
  },
);

ipcMain.handle(
  'gitwitan:repositories:stage',
  async (_event, repositoryId: string, filePaths: string[]) => {
    const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
    if (!repository) throw new Error('Tracked repository was not found.');
    await gitRepositoryService.stage(repository.path, filePaths);
  },
);

ipcMain.handle(
  'gitwitan:repositories:unstage',
  async (_event, repositoryId: string, filePaths: string[]) => {
    const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
    if (!repository) throw new Error('Tracked repository was not found.');
    await gitRepositoryService.unstage(repository.path, filePaths);
  },
);

ipcMain.handle('gitwitan:repositories:overview', async (_event, repositoryId: string) => {
  const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
  if (!repository) throw new Error('Tracked repository was not found.');
  return gitRepositoryService.readWorkspaceOverview(repositoryId, repository.path);
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
import type { RepositoryRecord, TrackedRepository } from '../src/types/repository-data';
import { GitRepositoryService } from './git-repository-service';
import { RepositoryRegistry } from './repository-registry';
const repositoryRegistry = new RepositoryRegistry(path.join(app.getPath('userData'), 'repositories.json'));
const gitRepositoryService = new GitRepositoryService();

const toRepositoryRecord = async (repository: TrackedRepository): Promise<RepositoryRecord> => {
  try {
    return {
      repository,
      summary: await gitRepositoryService.readSummary(repository.id, repository.path),
      error: undefined,
    };
  } catch (error: unknown) {
    return {
      repository,
      summary: undefined,
      error: error instanceof Error ? error.message : 'Unable to inspect repository.',
    };
  }
};
ipcMain.handle('gitwitan:repositories:list', async () =>
  Promise.all((await repositoryRegistry.list()).map(toRepositoryRecord)),
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
    return toRepositoryRecord(await repositoryRegistry.track(rootPath, path.basename(rootPath)));
  },
);

ipcMain.handle('gitwitan:repositories:add-existing', async (_event, folderPath: string) => {
  const rootPath = await gitRepositoryService.resolveRoot(folderPath);
  const repository = await repositoryRegistry.track(rootPath, path.basename(rootPath));
  return toRepositoryRecord(repository);
});

ipcMain.handle('gitwitan:repositories:refresh', async (_event, repositoryId: string) => {
  const repository = (await repositoryRegistry.list()).find((item) => item.id === repositoryId);
  if (!repository) {
    throw new Error('Tracked repository was not found.');
  }

  return toRepositoryRecord(repository);
});
