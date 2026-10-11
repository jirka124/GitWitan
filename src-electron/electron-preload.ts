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
import type { RepositorySnapshot, RepositoryStatusUpdate } from '../src/types/repository-data';

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
  bootstrap: () => ipcRenderer.invoke('gitwitan:repositories:bootstrap'),
  snapshot: (repositoryId: string) =>
    ipcRenderer.invoke('gitwitan:repositories:snapshot', repositoryId),
  activate: (repositoryId: string) =>
    ipcRenderer.invoke('gitwitan:repositories:activate', repositoryId),
  forceRefresh: (repositoryId: string) =>
    ipcRenderer.invoke('gitwitan:repositories:force-refresh', repositoryId),
  setOpen: (repositoryIds: string[]) =>
    ipcRenderer.invoke('gitwitan:repositories:set-open', repositoryIds),
  syncSession: (session: { openRepositoryIds: string[]; activeRepositoryId?: string }) =>
    ipcRenderer.invoke('gitwitan:repositories:sync-session', session),
  onSnapshotChanged: (listener: (snapshot: RepositorySnapshot) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, snapshot: RepositorySnapshot) =>
      listener(snapshot);
    ipcRenderer.on('gitwitan:repositories:snapshot-changed', handler);
    return () => ipcRenderer.removeListener('gitwitan:repositories:snapshot-changed', handler);
  },
  onStatusChanged: (listener: (update: RepositoryStatusUpdate) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, update: RepositoryStatusUpdate) =>
      listener(update);
    ipcRenderer.on('gitwitan:repositories:status-changed', handler);
    return () => ipcRenderer.removeListener('gitwitan:repositories:status-changed', handler);
  },
  addExisting: (folderPath: string) =>
    ipcRenderer.invoke('gitwitan:repositories:add-existing', folderPath),
  clone: (repositoryUrl: string, parentFolder: string, folderName: string) =>
    ipcRenderer.invoke('gitwitan:repositories:clone', repositoryUrl, parentFolder, folderName),
  init: (folderPath: string) => ipcRenderer.invoke('gitwitan:repositories:init', folderPath),
  refresh: (repositoryId: string) =>
    ipcRenderer.invoke('gitwitan:repositories:refresh', repositoryId),
  status: (repositoryId: string) =>
    ipcRenderer.invoke('gitwitan:repositories:status', repositoryId),
  overview: (repositoryId: string) =>
    ipcRenderer.invoke('gitwitan:repositories:overview', repositoryId),
  diff: (repositoryId: string, filePath: string, staged: boolean, untracked: boolean) =>
    ipcRenderer.invoke('gitwitan:repositories:diff', repositoryId, filePath, staged, untracked),
  stage: (repositoryId: string, filePaths: string[]) =>
    ipcRenderer.invoke('gitwitan:repositories:stage', repositoryId, filePaths),
  unstage: (repositoryId: string, filePaths: string[]) =>
    ipcRenderer.invoke('gitwitan:repositories:unstage', repositoryId, filePaths),
});
