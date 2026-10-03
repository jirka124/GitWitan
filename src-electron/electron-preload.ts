/**
 * This file is used specifically for security reasons.
 * Here you can securely expose privileged APIs into the renderer process
 * by leveraging Electron's contextBridge functionality and communicating
 * with the main process through Electron's inter-process communication (IPC).
 *
 * WARNING!
 * The preload script sandboxing offers limited access to a full Node.js environment.
 * Do NOT attempt to import packages from node_modules or use Node.js APIs directly in this file.
 * Instead, use IPC to communicate with the main process and access packages and Node.js
 * functionality there.
 *
 * Example on injecting window.myAPI.doAThing() into renderer thread:
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * Preload script documentation:
 * https://www.electronjs.org/docs/latest/tutorial/tutorial-preload
 */

import { contextBridge, ipcRenderer } from 'electron';
import { quasarRuntime } from '#q-app/electron/preload';

type WindowTheme = 'dark' | 'light';

/**
 * Can be used in the renderer process through `window.quasarRuntime`
 */
contextBridge.exposeInMainWorld('quasarRuntime', quasarRuntime);

contextBridge.exposeInMainWorld('gitwitanWindow', {
  setTheme: (theme: WindowTheme) => {
    ipcRenderer.send('gitwitan:set-window-theme', theme);
  },
});

contextBridge.exposeInMainWorld('gitwitanShell', {
  openExternal: (url: string) => ipcRenderer.invoke('gitwitan:open-external-url', url),
  selectFolder: (defaultPath?: string) => ipcRenderer.invoke('gitwitan:select-folder', defaultPath),
});


contextBridge.exposeInMainWorld('gitwitanRepositories', {
  list: () => ipcRenderer.invoke('gitwitan:repositories:list'),
  addExisting: (folderPath: string) =>
    ipcRenderer.invoke('gitwitan:repositories:add-existing', folderPath),
  refresh: (repositoryId: string) => ipcRenderer.invoke('gitwitan:repositories:refresh', repositoryId),
  status: (repositoryId: string) => ipcRenderer.invoke('gitwitan:repositories:status', repositoryId),
  diff: (repositoryId: string, filePath: string, staged: boolean) =>
    ipcRenderer.invoke('gitwitan:repositories:diff', repositoryId, filePath, staged),
  stage: (repositoryId: string, filePaths: string[]) =>
    ipcRenderer.invoke('gitwitan:repositories:stage', repositoryId, filePaths),
  unstage: (repositoryId: string, filePaths: string[]) =>
    ipcRenderer.invoke('gitwitan:repositories:unstage', repositoryId, filePaths),
});
