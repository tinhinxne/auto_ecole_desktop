/**
 * seedPayments.js  —  DEBUG ONLY
 * Insère des données factices dans Candidat, Paiement et Versement
 * pour tester l'écran Payments.jsx.
 *
 * Usage (depuis la racine du projet) :
 *   node src/main/seedPayments.js
 */

const db = require('./db');

// ─── Données fictives (miroir de l'ancien state Payments.jsx) ────────────────
//  methode mapping : "Compte" → "ccp"  |  "Par traiteur" → "especes"
const SEEDS = [
  {
    nom: 'Dubois', prenom: 'Marie', sexe: 'F', date_naissance: '1998-06-15',
    montantTotal: 30000, montantRestant: 19500, typePaiement: 'complet',
    versements: [
      { montant: 10500, typeVersement: 'seance', methode: 'ccp', dateVersement: '2026-03-05', numeroTranche: null },
    ],
  },
  {
    nom: 'Martin', prenom: 'Pierre', sexe: 'M', date_naissance: '2000-02-20',
    montantTotal: 25000, montantRestant: 12500, typePaiement: 'complet',
    versements: [
      { montant: 12500, typeVersement: 'seance', methode: 'ccp', dateVersement: '2026-03-06', numeroTranche: null },
    ],
  },
  {
    nom: 'Leroy', prenom: 'Sophie', sexe: 'F', date_naissance: '1999-11-03',
    montantTotal: 28000, montantRestant: 0, typePaiement: 'complet',
    versements: [
      { montant: 28000, typeVersement: 'seance', methode: 'ccp', dateVersement: '2026-03-07', numeroTranche: null },
    ],
  },
  {
    nom: 'Bernard', prenom: 'Luc', sexe: 'M', date_naissance: '2001-07-11',
    montantTotal: 32000, montantRestant: 19500, typePaiement: 'tranche',
    versements: [
      { montant:  6500, typeVersement: 'seance', methode: 'especes', dateVersement: '2026-03-01', numeroTranche: 1 },
      { montant:  6000, typeVersement: 'seance', methode: 'especes', dateVersement: '2026-03-08', numeroTranche: 2 },
    ],
  },
  {
    nom: 'Petit', prenom: 'Emma', sexe: 'F', date_naissance: '2002-04-25',
    montantTotal: 35000, montantRestant: 19500, typePaiement: 'tranche',
    versements: [
      { montant:  8000, typeVersement: 'seance', methode: 'especes', dateVersement: '2026-02-15', numeroTranche: 1 },
      { montant:  7500, typeVersement: 'seance', methode: 'especes', dateVersement: '2026-02-28', numeroTranche: 2 },
    ],
  },
];

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function seed() {
  console.log('🌱  Démarrage du seed paiements…\n');

  for (const s of SEEDS) {
    try {
      // 1. Insérer le candidat
      const candidatResult = await query(
        `INSERT INTO Candidat (nom, prenom, telephone, date_naissance, sexe, statut)
         VALUES (?, ?, ?, ?, ?, 'actif')`,
        [s.nom, s.prenom, '0700000000', s.date_naissance, s.sexe]
      );
      const idCandidat = candidatResult.insertId;
      console.log(`✅  Candidat inséré : ${s.prenom} ${s.nom} (id=${idCandidat})`);

      // 2. Créer le dossier Paiement
      const statutPaiement = s.montantRestant <= 0 ? 'solde' : 'en_attente';
      const paiementResult = await query(
        `INSERT INTO Paiement (montantTotal, montantRestant, typePaiement, statutPaiement, idCandidat)
         VALUES (?, ?, ?, ?, ?)`,
        [s.montantTotal, s.montantRestant, s.typePaiement, statutPaiement, idCandidat]
      );
      const idPaiement = paiementResult.insertId;
      console.log(`   💳  Paiement créé (id=${idPaiement}, type=${s.typePaiement}, restant=${s.montantRestant})`);

      // 3. Insérer les versements
      for (const v of s.versements) {
        await query(
          `INSERT INTO Versement
             (montant, typeVersement, datePaiement, methode, numeroTranche, dateVersement, idPaiement)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [v.montant, v.typeVersement, v.dateVersement, v.methode, v.numeroTranche, v.dateVersement, idPaiement]
        );
        console.log(`      💰  Versement ${v.montant} DA le ${v.dateVersement} (tranche ${v.numeroTranche ?? '-'})`);
      }
    } catch (err) {
      console.error(`❌  Erreur pour ${s.prenom} ${s.nom} :`, err.message);
    }
  }

  console.log('\n✅  Seed terminé.');
  db.end();
}

seed();