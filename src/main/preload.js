// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // La fonction générique (pratique pour tester n'importe quoi)
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),

    // --- AUTHENTIFICATION ---
    login: (credentials) => ipcRenderer.invoke('login', credentials)
    });