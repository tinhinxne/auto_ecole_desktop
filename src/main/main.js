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
      else resolve(res);
    });
  });
});
ipcMain.handle('add-candidat', async (event, data) => {
  const { nom, prenom, telephone, date_naissance, date_inscription, sexe, photo, statut } = data;

  let photoBuffer = null;
  if (photo && photo.startsWith("data:image")) {
    photoBuffer = Buffer.from(photo.split(",")[1], "base64");
  }

  const sql = `
    INSERT INTO Candidat (nom, prenom, telephone, date_naissance, date_inscription, sexe, photo, statut)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve) => {
    db.query(sql, [nom, prenom, telephone, date_naissance, date_inscription, sexe, photoBuffer, statut], (err) => {
      if (err) { console.error('add-candidat error:', err); return resolve(false); }
      resolve(true);
    });
  });
});
// 3. MONITEURS
// ipcMain.handle("getMoniteurs", async () => {
//   const [rows] = await db.query(`
//     SELECT m.id, u.nom, u.prenom
//     FROM Moniteur m
//     JOIN Utilisateur u ON m.id = u.id
//   `);
//   return rows;
// });

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

// 6. SÉANCES - Récupérer toutes les séances avec candidat(s) et moniteur
ipcMain.handle('get-seances', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        s.idSeance,
        s.date,
        s.heure,
        s.duree,
        s.type,
        s.statut,
        s.moniteur_id,
        CONCAT(u.prenom, ' ', u.nom) AS moniteurNom,
        GROUP_CONCAT(CONCAT(c.prenom, ' ', c.nom) SEPARATOR ', ') AS candidatsNoms,
        GROUP_CONCAT(c.idCandidat SEPARATOR ',') AS candidatsIds
      FROM Seance s
      JOIN Moniteur m ON s.moniteur_id = m.id
      JOIN Utilisateur u ON m.id = u.id
      LEFT JOIN CandidatSeance cs ON s.idSeance = cs.idSeance
      LEFT JOIN Candidat c ON cs.idCandidat = c.idCandidat
      GROUP BY s.idSeance
      ORDER BY s.date DESC, s.heure ASC
    `;
    db.query(sql, (err, res) => {
      if (err) {
        console.error('get-seances error:', err);
        resolve([]);
      } else {
        resolve(res);
      }
    });
  });
});

// 7. SÉANCES - Ajouter une nouvelle séance avec son/ses candidat(s)
// APRÈS ✅
ipcMain.handle('add-seance', async (event, seanceData) => {
    console.log("seanceData reçu:", seanceData);
  const { date, heure, type, statut, moniteur_id, candidatIds, duree } = seanceData; // ✅

  return new Promise((resolve) => {
    const sqlSeance = `
      INSERT INTO Seance (date, heure, type, statut, moniteur_id, duree)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sqlSeance, [date, heure, type, statut || 'planifiée', moniteur_id, duree || 1], (err, res) => {
      if (err) {
        console.error('add-seance insert error:', err);
        return resolve({ success: false, message: 'Erreur lors de la création de la séance.' });
      }

      const newSeanceId = res.insertId;

      if (!candidatIds || candidatIds.length === 0) {
        return resolve({ success: true, id: newSeanceId });
      }

      const values = candidatIds.map(cid => [cid, newSeanceId]);
      const sqlLink = `INSERT INTO CandidatSeance (idCandidat, idSeance) VALUES ?`;

      db.query(sqlLink, [values], (err2) => {
        if (err2) {
          console.error('add-seance link error:', err2);
          return resolve({ success: false, id: newSeanceId, message: 'Séance créée mais erreur association candidats.' });
        }
        resolve({ success: true, id: newSeanceId });
      });
    });
  });
});



ipcMain.handle('delete-seance', async (event, id) => {
  return new Promise((resolve) => {
    db.query('DELETE FROM Seance WHERE idSeance = ?', [id], (err) => {
      if (err) { console.error('delete-seance error:', err); return resolve(false); }
      resolve(true);
    });
  });
});

ipcMain.handle('update-seance', async (event, data) => {
  const { id, date, heure, type, statut, moniteur_id, duree } = data;
  return new Promise((resolve) => {
    db.query(
      'UPDATE Seance SET date=?, heure=?, type=?, statut=?, moniteur_id=?, duree=? WHERE idSeance=?',
      [date, heure, type, statut, moniteur_id, duree || 1, id],
      (err) => {
        if (err) { console.error('update-seance error:', err); return resolve(false); }
        resolve(true);
      }
    );
  });
});


ipcMain.handle('get-moniteurs', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        m.id,
        m.numeroTelephone,
        m.actif,
        u.nom,
        u.prenom,
        u.mail
      FROM Moniteur m
      JOIN Utilisateur u ON u.id = m.id
      ORDER BY u.nom ASC
    `;

    db.query(sql, (err, res) => {
      if (err) {
        console.error('get-moniteurs error:', err);
        return resolve([]);
      }
      resolve(res);
    });
  });
});