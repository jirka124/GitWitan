import { BrowserWindow, app, ipcMain, shell, type BrowserWindowConstructorOptions } from 'electron';
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
