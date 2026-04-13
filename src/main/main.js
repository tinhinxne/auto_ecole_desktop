const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db'); // Import de ta connexion MySQL

// --- GESTION DE LA FENÊTRE ---

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
  const { nom, prenom, telephone, date_naissance, sexe, photo, statut } = data;

  let photoBuffer = null;
  if (photo && photo.startsWith("data:image")) {
    const base64 = photo.split(",")[1];
    photoBuffer = Buffer.from(base64, "base64");
  }

  const sql = `
    INSERT INTO Candidat (nom, prenom, telephone, date_naissance, date_inscription, sexe, photo, statut)
    VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)
  `;

  return new Promise((resolve) => {
    db.query(sql, [nom, prenom, telephone, date_naissance, sexe, photoBuffer, statut], (err) => {
      if (err) {
        console.error('add-candidat error:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('update-candidat', async (event, c) => {
  return new Promise((resolve) => {
    const sql = `UPDATE Candidat 
      SET nom=?, prenom=?, telephone=?, date_naissance=?, sexe=?, photo=?, statut=?
      WHERE idCandidat=?`;

    db.query(
      sql,
      [c.nom, c.prenom, c.telephone, c.date_naissance, c.sexe, c.photo || null, c.statut, c.idCandidat],
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
    const sql = `
      SELECT u.id, u.nom, u.prenom, u.mail as email, m.numeroTelephone as telephone, 
             m.photo, IF(m.actif, 'actif', 'inactif') as statut
      FROM Utilisateur u
      JOIN Moniteur m ON u.id = m.id
      ORDER BY u.nom ASC`;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      else resolve(res);
    });
  });
});

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

ipcMain.handle('delete-moniteur', async (event, id) => {
  return new Promise((resolve) => {
    const sql = 'DELETE FROM Utilisateur WHERE id = ?';
    db.query(sql, [id], (err) => {
      if (err) resolve({ success: false });
      else resolve({ success: true });
    });
  });
});

// 4. DASHBOARD
ipcMain.handle('get-dashboard-stats', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM Candidat) as totalCandidats,
        (SELECT COUNT(*) FROM Seance WHERE date = CURDATE()) as sessionsToday,
        (SELECT SUM(montantVersement) FROM Versement WHERE MONTH(dateVersement) = MONTH(CURDATE())) as revenuMois
    `;
    db.query(sql, (err, res) => {
      if (err || !res) resolve({ totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });
      else resolve(res[0]);
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
      else resolve(res);
    });
  });
});

// 6. SÉANCES
ipcMain.handle('get-seances', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        s.idSeance, s.date, s.heure, s.duree, s.type, s.statut, s.moniteur_id,
        CONCAT(u.prenom, ' ', u.nom) AS moniteurNom,
        GROUP_CONCAT(CONCAT(c.prenom, ' ', c.nom) SEPARATOR ', ') AS candidatsNoms,
        GROUP_CONCAT(c.idCandidat SEPARATOR ',') AS candidatsIds
      FROM Seance s
      JOIN Moniteur m ON s.moniteur_id = m.id
      JOIN Utilisateur u ON m.id = u.id
      LEFT JOIN CandidatSeance cs ON s.idSeance = cs.idSeance
      LEFT JOIN Candidat c ON cs.idCandidat = c.idCandidat
      GROUP BY s.idSeance
      ORDER BY s.date DESC, s.heure ASC`;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      else resolve(res);
    });
  });
});

ipcMain.handle('add-seance', async (event, seanceData) => {
  const { date, heure, type, statut, moniteur_id, candidatIds, duree } = seanceData;
  return new Promise((resolve) => {
    const sqlSeance = `INSERT INTO Seance (date, heure, type, statut, moniteur_id, duree) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sqlSeance, [date, heure, type, statut || 'planifiée', moniteur_id, duree || 1], (err, res) => {
      if (err) return resolve({ success: false });

      const newSeanceId = res.insertId;
      if (!candidatIds || candidatIds.length === 0) return resolve({ success: true, id: newSeanceId });

      const values = candidatIds.map(cid => [cid, newSeanceId]);
      const sqlLink = `INSERT INTO CandidatSeance (idCandidat, idSeance) VALUES ?`;
      db.query(sqlLink, [values], (err2) => {
        if (err2) resolve({ success: false, id: newSeanceId });
        else resolve({ success: true, id: newSeanceId });
      });
    });
  });
});

ipcMain.handle('delete-seance', async (event, id) => {
  return new Promise((resolve) => {
    db.query('DELETE FROM Seance WHERE idSeance = ?', [id], (err) => {
      resolve(!err);
    });
  });
});

ipcMain.handle('update-seance', async (event, data) => {
  const { id, date, heure, type, statut, moniteur_id, duree, candidatId } = data;
  return new Promise((resolve) => {
    db.query(
      'UPDATE Seance SET date=?, heure=?, type=?, statut=?, moniteur_id=?, duree=? WHERE idSeance=?',
      [date, heure, type, statut, moniteur_id, duree || 1, id],
      (err) => {
        if (err) return resolve(false);
        if (!candidatId) return resolve(true);

        db.query('DELETE FROM CandidatSeance WHERE idSeance = ?', [id], (err2) => {
          if (err2) return resolve(false);
          db.query('INSERT INTO CandidatSeance (idCandidat, idSeance) VALUES (?, ?)', [parseInt(candidatId), id], (err3) => {
            resolve(!err3);
          });
        });
      }
    );
  });
});