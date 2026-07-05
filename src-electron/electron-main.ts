import { BrowserWindow, app, type BrowserWindowConstructorOptions } from 'electron';
import path from 'node:path';
import os from 'node:os';
import { registerQuasarRuntime, resolveElectronAssetsPath } from '#q-app/electron/main';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

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
      color: '#1d2024',
      symbolColor: '#eef1f4',
      height: 30,
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
    backgroundColor: '#151719',
    ...getTitleBarOptions(),
    webPreferences: {
      contextIsolation: true,
      // https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.join(import.meta.dirname, 'electron-preload.cjs'),
    },
  });

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
