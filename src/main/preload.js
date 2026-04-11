const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Auth
  login: (creds) => ipcRenderer.invoke('login', creds),
  
  // Candidats
  getCandidats: () => ipcRenderer.invoke('get-candidats'),
  addCandidat: (data) => ipcRenderer.invoke('add-candidat', data),
  
  // Moniteurs
  getMoniteurs: () => ipcRenderer.invoke('get-moniteurs'),
  
  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  
  // Paiements
  getPayments: () => ipcRenderer.invoke('get-payments'),
  addPayment: (data) => ipcRenderer.invoke('add-payment', data),

  //Seances
  getSeances: () => ipcRenderer.invoke('get-seances'),
addSeance:  (data) => ipcRenderer.invoke('add-seance', data),
deleteSeance: (id)   => ipcRenderer.invoke('delete-seance', id),
  updateSeance: (data) => ipcRenderer.invoke('update-seance', data),
});