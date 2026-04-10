const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Auth
  login: (creds) => ipcRenderer.invoke('login', creds),
  

   // Candidats
  getCandidats:    ()       => ipcRenderer.invoke('get-candidats'),
  addCandidat:     (data)   => ipcRenderer.invoke('add-candidat', data),
  updateCandidat:  (data)   => ipcRenderer.invoke('update-candidat', data),
  deleteCandidat:  (id)     => ipcRenderer.invoke('delete-candidat', id),
  // Moniteurs
  getMoniteurs: () => ipcRenderer.invoke('get-moniteurs'),
  
  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  
  // Paiements
  getPayments: () => ipcRenderer.invoke('get-payments'),
  addPayment: (data) => ipcRenderer.invoke('add-payment', data)
});