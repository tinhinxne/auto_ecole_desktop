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
      if (result.length > 0) resolve({ success: true, user: result[0] });
      else resolve({ success: false, message: "Identifiants incorrects" });
    });
  });
});

// 2. CANDIDATS (Lecture et Ajout)
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
ipcMain.handle('get-moniteurs', async () => {
  return new Promise((resolve) => {
    const sql = 'SELECT * FROM Moniteur';
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      resolve(res);
    });
  });
});

// 4. DASHBOARD STATS (Le moteur des graphiques)
ipcMain.handle('get-dashboard-stats', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM Candidat) as totalCandidats,
        (SELECT COUNT(*) FROM Seance WHERE dateSeance = CURDATE()) as sessionsToday,
        (SELECT SUM(montantVersement) FROM Versement WHERE MONTH(dateVersement) = MONTH(CURDATE())) as revenuMois
    `;
    db.query(sql, (err, res) => {
      if (err) resolve({ totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });
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