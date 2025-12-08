import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    appReady: () => ipcRenderer.send('app-ready'),
});
