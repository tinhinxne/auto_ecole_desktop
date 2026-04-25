const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ── CONFIG EMAIL ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'tinhinanethequeen@gmail.com',
    pass: 'gjgw vqfa qzkp wbfa',
  },
});

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.randomBytes(length))
    .map((b) => chars[b % chars.length])
    .join("");
}

function buildEmailHtml({ prenom, nom, email, password, isReset = false }) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
      <div style="background:#4E96E1;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">🚗 Auto-École</h1>
      </div>
      <div style="padding:28px;">
        <h2 style="color:#0F172A;margin-bottom:8px;">
          ${isReset ? "Réinitialisation de votre mot de passe" : `Bienvenue, ${prenom} !`}
        </h2>
        <p style="color:#475569;margin-bottom:20px;">
          ${isReset
            ? "Votre mot de passe a été réinitialisé par l'administrateur."
            : 'Votre compte moniteur vient d\'être créé. Voici vos identifiants de connexion :'}
        </p>
        <div style="background:#F1F5F9;border-radius:8px;padding:16px;margin-bottom:20px;">
          <p style="margin:4px 0;color:#475569;"><strong>Nom :</strong> ${prenom} ${nom}</p>
          <p style="margin:4px 0;color:#475569;"><strong>Email :</strong> ${email}</p>
          <p style="margin:8px 0 4px;color:#0F172A;font-size:15px;">
            <strong>Mot de passe :</strong>
            <span style="background:#4E96E1;color:#fff;padding:3px 10px;border-radius:6px;font-family:monospace;font-size:16px;margin-left:8px;">${password}</span>
          </p>
        </div>
        <p style="color:#94A3B8;font-size:12px;">Pensez à changer votre mot de passe après votre première connexion.</p>
      </div>
    </div>
  `;
}

// ── FENÊTRE ──────────────────────────────────────────────────────────────────
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
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ══════════════════════════════════════════════════════════════════════════════
//  IPC HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

// 1. LOGIN
ipcMain.handle("login", async (event, credentials) => {
  const { email, password } = credentials;

  // JOIN with Moniteur to also fetch the `actif` flag when applicable
  const sql = `
    SELECT u.id, u.nom, u.type_utilisateur, m.actif
    FROM Utilisateur u
    LEFT JOIN Moniteur m ON u.id = m.id
    WHERE u.mail = ? AND u.mot_de_passe = ?
  `;

  return new Promise((resolve) => {
    db.query(sql, [email, password], (err, result) => {
      if (err) return resolve({ success: false, message: "Erreur Base de données" });

      if (result && result.length > 0) {
        const user = result[0];

        // Block inactive moniteurs
        if (user.type_utilisateur === 'moniteur' && user.actif === 0) {
          return resolve({ success: false, inactive: true });
        }

        resolve({ success: true, user });
      } else {
        resolve({ success: false, message: "Identifiants incorrects" });
      }
    });
  });
});

// 2. CANDIDATS
ipcMain.handle("get-candidats", async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT c.*, p.montantTotal, p.montantRestant, p.statutPaiement 
      FROM Candidat c
      LEFT JOIN Paiement p ON c.idCandidat = p.idCandidat
      ORDER BY c.idCandidat DESC`;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      else resolve(res);
    });
  });
});

ipcMain.handle("add-candidat", async (event, data) => {
  const { nom, prenom, telephone, date_naissance, sexe, photo, statut } = data;
  let photoBuffer = null;
  if (photo && photo.startsWith("data:image")) {
    photoBuffer = Buffer.from(photo.split(",")[1], "base64");
  }
  const sql = `
    INSERT INTO Candidat (nom, prenom, telephone, date_naissance, date_inscription, sexe, photo, statut)
    VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)
  `;
  return new Promise((resolve) => {
    db.query(sql, [nom, prenom, telephone, date_naissance, sexe, photoBuffer, statut], (err) => {
      if (err) { console.error('add-candidat error:', err); resolve(false); }
      else resolve(true);
    });
  });
});

ipcMain.handle("update-candidat", async (event, c) => {
  return new Promise((resolve) => {
    const sql = `UPDATE Candidat 
      SET nom=?, prenom=?, telephone=?, date_naissance=?, sexe=?, photo=?, statut=?
      WHERE idCandidat=?`;
    db.query(sql, [c.nom, c.prenom, c.telephone, c.date_naissance, c.sexe, c.photo || null, c.statut, c.idCandidat], (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true });
    });
  });
});

ipcMain.handle("delete-candidat", async (event, id) => {
  return new Promise((resolve) => {
    db.query(`DELETE FROM Candidat WHERE idCandidat = ?`, [id], (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true });
    });
  });
});

// 3. MONITEURS
ipcMain.handle("get-moniteurs", async () => {
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

ipcMain.handle("add-moniteur", async (event, m) => {
  const password = generatePassword();
  return new Promise((resolve) => {
    const sqlUser = `
      INSERT INTO Utilisateur (nom, prenom, mail, mot_de_passe, type_utilisateur)
      VALUES (?, ?, ?, ?, 'moniteur')
    `;

    db.query(sqlUser, [m.nom, m.prenom, m.email, password], (err, res) => {
      if (err) {
        console.error("User Insert Error:", err.message);
        return resolve({ success: false, error: err.message });
      }

      const newId = res.insertId;

      const sqlMoniteur = `
        INSERT INTO Moniteur (id, numeroTelephone, actif, photo)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        sqlMoniteur,
        [newId, m.telephone, m.statut === "actif" ? 1 : 0, m.photo],
        async (err2) => {
          if (err2) {
            console.error("Moniteur Insert Error:", err2.message);
            return resolve({ success: false, error: err2.message });
          }

          let emailSent = false;
          try {
            await transporter.sendMail({
              from: '"Auto-École 🚗" <tinhinanethequeen@gmail.com>',
              to: m.email,
              subject: "Vos identifiants de connexion – Auto-École",
              html: buildEmailHtml({
                prenom: m.prenom,
                nom: m.nom,
                email: m.email,
                password,
              }),
            });
            emailSent = true;
          } catch (emailErr) {
            console.error("Erreur envoi email:", emailErr.message);
          }

          resolve({ success: true, id: newId, password, emailSent });
        }
      );
    });
  });
});

ipcMain.handle("reset-moniteur-password", async (event, data) => {
  const { id, email, prenom, nom } = data;
  const newPassword = generatePassword();
  return new Promise((resolve) => {
    db.query(
      'UPDATE Utilisateur SET mot_de_passe = ? WHERE id = ?',
      [newPassword, id],
      async (err) => {
        if (err) return resolve({ success: false });
        try {
          await transporter.sendMail({
            from: '"Auto-École 🚗" <tinhinanethequeen@gmail.com>',
            to: email,
            subject: "Réinitialisation de votre mot de passe – Auto-École",
            html: buildEmailHtml({ prenom, nom, email, password: newPassword, isReset: true }),
          });
        } catch (emailErr) {
          console.error("Erreur envoi email reset:", emailErr.message);
        }
        resolve({ success: true });
      }
    );
  });
});

ipcMain.handle("update-moniteur", async (event, m) => {
  return new Promise((resolve) => {
    const sqlUser = `UPDATE Utilisateur SET nom=?, prenom=?, mail=? WHERE id=?`;
    db.query(sqlUser, [m.nom, m.prenom, m.email, m.id], (err) => {
      if (err) return resolve({ success: false });
      const sqlMon = `UPDATE Moniteur SET numeroTelephone=?, actif=?, photo=? WHERE id=?`;
      db.query(sqlMon, [m.telephone, m.statut === 'actif' ? 1 : 0, m.photo || null, m.id], (err2) => {
        if (err2) resolve({ success: false });
        else resolve({ success: true });
      });
    });
  });
});

ipcMain.handle("delete-moniteur", async (event, id) => {
  return new Promise((resolve) => {
    db.query('DELETE FROM Utilisateur WHERE id = ?', [id], (err) => {
      if (err) resolve({ success: false });
      else resolve({ success: true });
    });
  });
});

// 4. DASHBOARD
ipcMain.handle("get-dashboard-stats", async () => {
  return new Promise((resolve) => {
    db.query('SELECT COUNT(*) as total FROM Candidat', (err1, res1) => {
      if (err1) return resolve({ totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });

      const totalCandidats = res1[0].total;

      db.query('SELECT COUNT(*) as total FROM Seance WHERE date = CURDATE()', (err2, res2) => {
        if (err2) return resolve({ totalCandidats, sessionsToday: 0, revenuMois: 0 });

        const sessionsToday = res2[0].total;

        db.query(
          `SELECT COALESCE(SUM(montant), 0) as total 
           FROM Versement 
           WHERE MONTH(dateVersement) = MONTH(CURDATE()) 
           AND YEAR(dateVersement) = YEAR(CURDATE())`,
          (err3, res3) => {
            const revenuMois = err3 ? 0 : res3[0].total;
            resolve({ totalCandidats, sessionsToday, revenuMois });
          }
        );
      });
    });
  });
});

// 5. PAIEMENTS
ipcMain.handle('add-payment', async (event, data) => {
  const { idCandidat, montant, methode, dateVersement, remarque, typeVersement } = data;
  const PRIX_PERMIS = 30000;
  const versement = parseFloat(montant);

  return new Promise((resolve) => {
    db.query('SELECT * FROM Paiement WHERE idCandidat = ? LIMIT 1', [idCandidat], (err, rows) => {
      if (err) return resolve({ success: false, message: "Erreur DB: " + err.message });

      const enregistrer = (idPaiement, restantActuel, numeroTranche) => {
        if (restantActuel <= 0) {
          return resolve({ success: false, message: "Action bloquée : ce candidat a déjà soldé son compte." });
        }
        if (versement > restantActuel) {
          return resolve({ success: false, message: `Le montant (${versement} DA) dépasse le reste à payer (${restantActuel} DA).` });
        }
        const nouveauRestant = Math.max(0, restantActuel - versement);
        const nouveauStatut = nouveauRestant <= 0 ? 'payé' : 'en_cours';

        db.query('UPDATE Paiement SET montantRestant = ?, statutPaiement = ? WHERE idPaiement = ?',
          [nouveauRestant, nouveauStatut, idPaiement], (err2) => {
            if (err2) return resolve({ success: false, message: "Erreur Update: " + err2.message });
            db.query(
              `INSERT INTO Versement (montant, typeVersement, datePaiement, methode, numeroTranche, remarque, dateVersement, idPaiement)
               VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`,
              [versement, typeVersement || 'seance', methode, numeroTranche, remarque || null, dateVersement, idPaiement],
              (err3) => {
                if (err3) return resolve({ success: false, message: "Erreur Versement: " + err3.message });
                resolve({ success: true, montantRestant: nouveauRestant });
              }
            );
          }
        );
      };

      if (rows && rows.length > 0) {
        const p = rows[0];
        db.query('SELECT COUNT(*) as nb FROM Versement WHERE idPaiement = ?', [p.idPaiement], (errTranche, countRes) => {
          const tranche = (countRes?.[0]?.nb || 0) + 1;
          enregistrer(p.idPaiement, parseFloat(p.montantRestant), tranche);
        });
      } else {
        const typePaiement = versement >= PRIX_PERMIS ? 'complet' : 'tranche';
        db.query(
          `INSERT INTO Paiement (montantTotal, montantRestant, typePaiement, statutPaiement, idCandidat)
           VALUES (?, ?, ?, 'en_cours', ?)`,
          [PRIX_PERMIS, PRIX_PERMIS, typePaiement, idCandidat],
          (errInsert, resInsert) => {
            if (errInsert) return resolve({ success: false, message: "Erreur Création Paiement" });
            enregistrer(resInsert.insertId, PRIX_PERMIS, 1);
          }
        );
      }
    });
  });
});

ipcMain.handle("get-payments", async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        v.idVersement, v.montant, v.methode, v.dateVersement,
        v.remarque, v.typeVersement, v.numeroTranche,
        c.nom, c.prenom, c.idCandidat,
        p.montantTotal, p.montantRestant, p.statutPaiement, p.idPaiement
      FROM Versement v
      JOIN Paiement p ON v.idPaiement = p.idPaiement
      JOIN Candidat c ON p.idCandidat = c.idCandidat
      ORDER BY v.dateVersement DESC
    `;
    db.query(sql, (err, res) => {
      if (err) resolve([]);
      else resolve(res);
    });
  });
});

ipcMain.handle('get-candidats-debiteurs', async () => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        c.idCandidat, c.nom, c.prenom, c.telephone,
        COALESCE(p.montantTotal, 30000) AS montantTotal,
        COALESCE(p.montantRestant, 30000) AS montantRestant,
        COALESCE(p.statutPaiement, 'en_attente') AS statutPaiement
      FROM Candidat c
      LEFT JOIN Paiement p ON c.idCandidat = p.idCandidat
      WHERE p.idPaiement IS NULL OR p.montantRestant > 0
      ORDER BY c.nom ASC
    `;
    db.query(sql, (err, res) => {
      if (err) { console.error(err); resolve([]); }
      else resolve(res);
    });
  });
});

// 6. SÉANCES
ipcMain.handle("get-seances", async () => {
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

ipcMain.handle("add-seance", async (event, seanceData) => {
  const { date, heure, type, statut, moniteur_id, candidatIds, duree } = seanceData;
  return new Promise((resolve) => {
    const sqlSeance = `INSERT INTO Seance (date, heure, type, statut, moniteur_id, duree) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sqlSeance, [date, heure, type, statut || 'planifiée', moniteur_id, duree || 1], (err, res) => {
      if (err) return resolve({ success: false });
      const newSeanceId = res.insertId;
      if (!candidatIds || candidatIds.length === 0) return resolve({ success: true, id: newSeanceId });
      const values = candidatIds.map(cid => [cid, newSeanceId]);
      db.query(`INSERT INTO CandidatSeance (idCandidat, idSeance) VALUES ?`, [values], (err2) => {
        if (err2) resolve({ success: false, id: newSeanceId });
        else resolve({ success: true, id: newSeanceId });
      });
    });
  });
});

ipcMain.handle("delete-seance", async (event, id) => {
  return new Promise((resolve) => {
    db.query("DELETE FROM Seance WHERE idSeance = ?", [id], (err) => {
      resolve(!err);
    });
  });
});

ipcMain.handle("update-seance", async (event, data) => {
  const { id, date, heure, type, statut, moniteur_id, duree, candidatId } = data;
  return new Promise((resolve) => {
    db.query(
      "UPDATE Seance SET date=?, heure=?, type=?, statut=?, moniteur_id=?, duree=? WHERE idSeance=?",
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


// NOUVEAU : Paiements filtrés par moniteur_id
ipcMain.handle('get-payments-by-moniteur', async (event, moniteurId) => {
  return new Promise((resolve) => {
    const sql = `
      SELECT 
        v.idVersement, v.montant, v.methode, v.dateVersement,
        v.remarque, v.typeVersement, v.numeroTranche,
        c.nom, c.prenom, c.idCandidat,
        p.montantTotal, p.montantRestant, p.statutPaiement, p.idPaiement
      FROM Versement v
      JOIN Paiement p     ON v.idPaiement     = p.idPaiement
      JOIN Candidat c     ON p.idCandidat      = c.idCandidat
      JOIN CandidatSeance cs ON cs.idCandidat  = c.idCandidat
      JOIN Seance s        ON cs.idSeance       = s.idSeance
      WHERE s.moniteur_id = ?
      GROUP BY v.idVersement
      ORDER BY v.dateVersement DESC
    `;
    db.query(sql, [moniteurId], (err, res) => {
      if (err) { console.error('get-payments-by-moniteur:', err); resolve([]); }
      else resolve(res);
    });
  });
});

// NOUVEAU : Candidats débiteurs du moniteur uniquement
ipcMain.handle('get-candidats-debiteurs-moniteur', async (event, moniteurId) => {
  return new Promise((resolve) => {
    const sql = `
      SELECT DISTINCT
        c.idCandidat, c.nom, c.prenom, c.telephone,
        COALESCE(p.montantTotal,  30000) AS montantTotal,
        COALESCE(p.montantRestant, 30000) AS montantRestant,
        COALESCE(p.statutPaiement, 'en_attente') AS statutPaiement
      FROM Candidat c
      JOIN CandidatSeance cs ON cs.idCandidat = c.idCandidat
      JOIN Seance s           ON cs.idSeance   = s.idSeance
      LEFT JOIN Paiement p   ON p.idCandidat   = c.idCandidat
      WHERE s.moniteur_id = ?
        AND (p.idPaiement IS NULL OR p.montantRestant > 0)
      ORDER BY c.nom ASC
    `;
    db.query(sql, [moniteurId], (err, res) => {
      if (err) { console.error('get-candidats-debiteurs-moniteur:', err); resolve([]); }
      else resolve(res);
    });
  });
});