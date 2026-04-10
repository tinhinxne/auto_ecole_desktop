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
// 2. CANDIDATS — version corrigée + complète

ipcMain.handle('get-candidats', async () => {
  return new Promise((resolve) => {
    const sql = `SELECT * FROM Candidat ORDER BY idCandidat DESC`;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      else resolve(res);
    });
  });
});

ipcMain.handle('add-candidat', async (event, data) => {
  const { nom, prenom, telephone, date_naissance, date_inscription, sexe, photo, statut } = data;

  let photoBuffer = null;
  if (photo && photo.startsWith("data:image")) {
    const base64 = photo.split(",")[1];
    photoBuffer = Buffer.from(base64, "base64"); // <-- ici Node.js peut utiliser Buffer
  }

  const sql = `
    INSERT INTO Candidat
      (nom, prenom, telephone, date_naissance, date_inscription, sexe, photo, statut)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.execute(sql, [
    nom,
    prenom,
    telephone,
    date_naissance,
    date_inscription,
    sexe,
    photoBuffer,
    statut
  ]);

  return true;
});

ipcMain.handle('update-candidat', async (event, c) => {
  return new Promise((resolve) => {
    const sql = `UPDATE Candidat 
      SET nom=?, prenom=?, telephone=?, date_naissance=?, date_inscription=?, sexe=?, photo=?, statut=?
      WHERE idCandidat=?`;

    db.query(
      sql,
      [
        c.nom,
        c.prenom,
        c.telephone,
        c.date_naissance,
        c.date_inscription, // 👈 AJOUT
        c.sexe,
        c.photo || null,
        c.statut,
        c.idCandidat
      ],
      (err) => {
        if (err) resolve({ success: false, error: err.message });
        else resolve({ success: true });
      }
    );
  });
});

ipcMain.handle('delete-candidat', async (event, id) => {
  return new Promise((resolve) => {
    const sql = `DELETE FROM Candidat WHERE idCandidat = ?`;
    db.query(sql, [id], (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true });
    });
  });
});
// 3. MONITEURS
ipcMain.handle('get-moniteurs', async () => {
  return new Promise((resolve) => {
    const sql = 'SELECT * FROM Moniteur';
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      resolve(res);
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