const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db   = require('./db');

// ── Handlers modulaires ──────────────────────────────────────────────────────
const registerPaymentHandlers = require('./paymentHandlers');

// ─── FENÊTRE ────────────────────────────────────────────────────────────────
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ════════════════════════════════════════════════════════════════════
//  IPC HANDLERS
// ════════════════════════════════════════════════════════════════════

// 1. LOGIN
ipcMain.handle('login', async (_event, credentials) => {
  const { email, password } = credentials;
  const sql = 'SELECT id, nom, type_utilisateur FROM Utilisateur WHERE mail = ? AND mot_de_passe = ?';
  return new Promise((resolve) => {
    db.query(sql, [email, password], (err, result) => {
      if (err) return resolve({ success: false, message: 'Erreur base de données' });
      if (result && result.length > 0) resolve({ success: true, user: result[0] });
      else resolve({ success: false, message: 'Identifiants incorrects' });
    });
  });
});

// 2. CANDIDATS
ipcMain.handle('get-candidats', async () => {
  return new Promise((resolve) => {
    db.query('SELECT * FROM Candidat ORDER BY idCandidat DESC', (err, res) => {
      if (err) return resolve([]);
      resolve(res);
    });
  });
});

ipcMain.handle('add-candidat', async (_event, c) => {
  return new Promise((resolve) => {
    const sql = 'INSERT INTO Candidat (nom, prenom, telephone, date_naissance, sexe) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [c.nom, c.prenom, c.tel, c.date_naissance, c.sexe], (err, res) => {
      if (err) return resolve({ success: false, error: err.message });
      resolve({ success: true, id: res.insertId });
    });
  });
});

// 3. MONITEURS
ipcMain.handle('get-moniteurs', async () => {
  return new Promise((resolve) => {
    db.query('SELECT * FROM Moniteur', (err, res) => {
      if (err) return resolve([]);
      resolve(res);
    });
  });
});

// 4. DASHBOARD STATS
ipcMain.handle('get-dashboard-stats', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT
        (SELECT COUNT(*)                   FROM Candidat)                                                AS totalCandidats,
        (SELECT COUNT(*)                   FROM Seance   WHERE dateSeance = CURDATE())                   AS sessionsToday,
        (SELECT SUM(montant)               FROM Versement WHERE MONTH(dateVersement) = MONTH(CURDATE())) AS revenuMois
    `;
    db.query(sql, (err, res) => {
      if (err || !res) return resolve({ totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });
      resolve(res[0]);
    });
  });
});

// 5. PAIEMENTS  (délégué au module dédié)
registerPaymentHandlers(ipcMain, db);