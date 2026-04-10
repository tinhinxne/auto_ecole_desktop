const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Auth
  login: (creds) => ipcRenderer.invoke('login', creds),

  // Candidats
  getCandidats: ()       => ipcRenderer.invoke('get-candidats'),
  addCandidat:  (data)   => ipcRenderer.invoke('add-candidat', data),

  // Moniteurs
  getMoniteurs: () => ipcRenderer.invoke('get-moniteurs'),

  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),

  // Paiements
  getPayments:       ()       => ipcRenderer.invoke('get-payments'),
  getPaymentHistory: (idCandidat) => ipcRenderer.invoke('get-payment-history', idCandidat),
  addPayment:        (data)   => ipcRenderer.invoke('add-payment', data),
  createPaiement:    (data)   => ipcRenderer.invoke('create-paiement', data),
});