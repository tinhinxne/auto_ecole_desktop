const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db'); // Import de ta connexion MySQL

// --- GESTION DE LA FENÊTRE ---

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // Ces constantes sont générées automatiquement par le plugin Webpack d'Electron Forge
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Charge l'URL de ton interface (React, Vue ou HTML)
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Ouvre l'inspecteur si tu veux debugger
  // mainWindow.webContents.openDevTools();
}

// Lancement de l'app
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ══════════════════════════════════════════════
//  FONCTIONS DE COMMUNICATION (IPC) - BACKEND
// ══════════════════════════════════════════════

// 1. LOGIN
ipcMain.handle('login', async (event, credentials) => {
  const { email, password } = credentials;
  const sql = 'SELECT id, nom, type_utilisateur FROM Utilisateur WHERE mail = ? AND mot_de_passe = ?';
  
  return new Promise((resolve) => {
    db.query(sql, [email, password], (err, result) => {
      if (err) resolve({ success: false, message: "Erreur Base de données" });
      if (result && result.length > 0) resolve({ success: true, user: result[0] });
      else resolve({ success: false, message: "Identifiants incorrects" });
    });
  });
});

// 2. CANDIDATS
ipcMain.handle('get-candidats', async () => {
  return new Promise((resolve) => {
    const sql = `SELECT * FROM Candidat ORDER BY idCandidat DESC`;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      resolve(res);
    });
  });
});

ipcMain.handle('add-candidat', async (event, c) => {
  return new Promise((resolve) => {
    const sql = 'INSERT INTO Candidat (nom, prenom, tel, date_inscription, sexe) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [c.nom, c.prenom, c.tel, c.date_inscription, c.sexe], (err, res) => {
      if (err) resolve({ success: false });
      resolve({ success: true, id: res.insertId });
    });
  });
});

// 3. MONITEURS
// RÉCUPÉRER (On ajoute m.photo)
ipcMain.handle('get-moniteurs', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT u.id, u.nom, u.prenom, u.mail as email, m.numeroTelephone as telephone, 
             m.photo, IF(m.actif, 'actif', 'inactif') as statut
      FROM Utilisateur u
      JOIN Moniteur m ON u.id = m.id
    `;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      else resolve(res);
    });
  });
});

// AJOUTER (On inclut m.photo)
ipcMain.handle('add-moniteur', async (event, m) => {
  return new Promise((resolve) => {
    const sqlUser = 'INSERT INTO Utilisateur (nom, prenom, mail, mot_de_passe, type_utilisateur) VALUES (?, ?, ?, "123456", "moniteur")';
    db.query(sqlUser, [m.nom, m.prenom, m.email], (err, res) => {
      if (err) return resolve({ success: false });

      const newId = res.insertId;
      const sqlMoniteur = 'INSERT INTO Moniteur (id, numeroTelephone, actif, photo) VALUES (?, ?, ?, ?)';
      db.query(sqlMoniteur, [newId, m.telephone, m.statut === 'actif', m.photo], (err2) => {
        if (err2) resolve({ success: false });
        else resolve({ success: true, id: newId });
      });
    });
  });
});

// MODIFIER (On inclut m.photo)
ipcMain.handle('update-moniteur', async (event, m) => {
  return new Promise((resolve) => {
    const sqlUser = 'UPDATE Utilisateur SET nom = ?, prenom = ?, mail = ? WHERE id = ?';
    db.query(sqlUser, [m.nom, m.prenom, m.email, m.id], (err) => {
      if (err) return resolve({ success: false });

      const sqlMoniteur = 'UPDATE Moniteur SET numeroTelephone = ?, actif = ?, photo = ? WHERE id = ?';
      db.query(sqlMoniteur, [m.telephone, m.statut === 'actif', m.photo, m.id], (err2) => {
        if (err2) resolve({ success: false });
        else resolve({ success: true });
      });
    });
  });
});
// SUPPRIMER UN MONITEUR
ipcMain.handle('delete-moniteur', async (event, id) => {
  return new Promise((resolve) => {
    const sql = 'DELETE FROM Utilisateur WHERE id = ?';
    db.query(sql, [id], (err) => {
      if (err) resolve({ success: false });
      else resolve({ success: true });
    });
  });
});
// 4. DASHBOARD STATS
ipcMain.handle('get-dashboard-stats', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM Candidat) as totalCandidats,
        (SELECT COUNT(*) FROM Seance WHERE dateSeance = CURDATE()) as sessionsToday,
        (SELECT SUM(montantVersement) FROM Versement WHERE MONTH(dateVersement) = MONTH(CURDATE())) as revenuMois
    `;
    db.query(sql, (err, res) => {
      if (err || !res) resolve({ totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });
      resolve(res[0]);
    });
  });
});

// 5. PAIEMENTS
ipcMain.handle('get-payments', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT v.*, c.nom, c.prenom 
      FROM Versement v 
      JOIN Candidat c ON v.idCandidat = c.idCandidat 
      ORDER BY v.dateVersement DESC`;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      resolve(res);
    });
  });
});