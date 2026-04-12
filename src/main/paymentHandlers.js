/**
 * paymentHandlers.js
 * Tous les handlers IPC liés aux paiements / versements.
 * À importer dans main.js via : require('./paymentHandlers')(ipcMain, db)
 */

module.exports = function registerPaymentHandlers(ipcMain, db) {

  // ─────────────────────────────────────────────────────────────
  // GET ALL PAYMENTS
  // ─────────────────────────────────────────────────────────────
  ipcMain.handle('get-payments', async () => {
    return new Promise((resolve) => {
      const sql = `
        SELECT
          v.idVersement,
          v.montant,
          v.typeVersement,
          v.datePaiement,
          v.methode,
          v.numeroTranche,
          v.remarque,
          v.dateVersement,
          p.idPaiement,
          p.montantTotal,
          p.montantRestant,
          p.typePaiement,
          p.statutPaiement,
          c.idCandidat,
          CONCAT(c.nom, ' ', c.prenom) AS name
        FROM Versement v
        JOIN Paiement  p ON v.idPaiement  = p.idPaiement
        JOIN Candidat  c ON p.idCandidat  = c.idCandidat
        ORDER BY v.dateVersement DESC
      `;
      db.query(sql, (err, rows) => {
        if (err) { console.error('[get-payments]', err); return resolve([]); }
        resolve(rows);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET PAYMENT HISTORY FOR ONE CANDIDATE
  // ─────────────────────────────────────────────────────────────
  ipcMain.handle('get-payment-history', async (_event, idCandidat) => {
    return new Promise((resolve) => {
      const sql = `
        SELECT
          v.idVersement,
          v.montant,
          v.typeVersement,
          v.datePaiement,
          v.methode,
          v.numeroTranche,
          v.remarque,
          v.dateVersement,
          p.idPaiement,
          p.montantTotal,
          p.montantRestant,
          p.typePaiement,
          p.statutPaiement
        FROM Versement v
        JOIN Paiement p ON v.idPaiement = p.idPaiement
        WHERE p.idCandidat = ?
        ORDER BY v.dateVersement ASC
      `;
      db.query(sql, [idCandidat], (err, rows) => {
        if (err) { console.error('[get-payment-history]', err); return resolve([]); }
        resolve(rows);
      });
    });
  });



}