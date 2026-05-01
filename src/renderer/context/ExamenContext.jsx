// src/renderer/context/ExamenContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useExamenRulesCtx } from "./ExamenRulesContext";

const ExamenContext = createContext(null);

// Seuils de séances pour chaque type d'examen
export const EXAM_THRESHOLDS = {
  Code:        5,   // à partir de 5 séances
  Créneau:    11,   // à partir de 11 séances (Code réussi)
  Circulation: 17,  // à partir de 17 séances (Créneau réussi)
};

// Préfixe localStorage pour la persistance
const LS_KEY = "examens_list";
const LS_REPORTS_KEY = "examens_reports"; // candidats retirés temporairement

export function ExamenProvider({ children }) {
  const { examRules } = useExamenRulesCtx();

  const [examensList, setExamensList] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // candidatsReportés : { [candidatId]: { nextSuggestedDate, type, reason } }
  const [candidatsReportes, setCandidatsReportes] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_REPORTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Persiste à chaque changement
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(examensList));
  }, [examensList]);

  useEffect(() => {
    localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(candidatsReportes));
  }, [candidatsReportes]);

  /**
   * Calcule la prochaine date d'examen selon les règles
   * @param {string} fromDate - date ISO de référence (ex: aujourd'hui)
   * @param {string[]} joursAutorises - ex: ["Lun","Mer","Ven"]
   * @param {number} delaiJours - délai minimum en jours
   */
  const getNextExamDate = (fromDate, joursAutorises, delaiJours = 0) => {
    const DAY_MAP = { Dim: 0, Lun: 1, Mar: 2, Mer: 3, Jeu: 4, Ven: 5, Sam: 6 };
    const allowedDays = (joursAutorises || ["Lun", "Mer", "Ven"]).map(d => DAY_MAP[d]);
    
    const base = new Date(fromDate);
    base.setDate(base.getDate() + Math.max(delaiJours, 1));
    
    // Cherche le prochain jour autorisé
    for (let i = 0; i < 14; i++) {
      if (allowedDays.includes(base.getDay())) {
        return base.toISOString().split("T")[0];
      }
      base.setDate(base.getDate() + 1);
    }
    return base.toISOString().split("T")[0];
  };

  /**
   * Génère automatiquement les examens à partir de la liste de séances
   * @param {Array} seances - séances depuis la BDD (get-seances)
   * @param {Array} candidats - candidats depuis la BDD
   */
  const generateExamens = (seances, candidats) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Groupe les séances par candidat
    const seancesParCandidat = {};
    seances.forEach(s => {
      const ids = s.candidatsIds ? s.candidatsIds.split(",") : [];
      ids.forEach(cid => {
        const id = cid.trim();
        if (!id) return;
        if (!seancesParCandidat[id]) seancesParCandidat[id] = [];
        seancesParCandidat[id].push(s);
      });
    });

    const nouveauxExamens = [];

    candidats.forEach(candidat => {
      const cid = String(candidat.idCandidat);
      const seancesCand = seancesParCandidat[cid] || [];
      const nbSeances = seancesCand.length;

      // Vérifie si le candidat est bloqué (impayé)
      if (examRules.blocageImpaye && candidat.montantRestant > 0) return;

      // Récupère l'historique des examens de ce candidat
      const examsCand = examensList.filter(e => String(e.candidatId) === cid);
      
      const aReussiCode = examsCand.some(e => e.type === "Code" && e.status === "Passed");
      const aReussiCreneau = examsCand.some(e => e.type === "Créneau" && e.status === "Passed");

      // Compte les échecs par type
      const echecsCode = examsCand.filter(e => e.type === "Code" && e.status === "Failed").length;
      const echecsCreneau = examsCand.filter(e => e.type === "Créneau" && e.status === "Failed").length;
      const echecsCirculation = examsCand.filter(e => e.type === "Circulation" && e.status === "Failed").length;

      // Vérifie si déjà un examen schedulé pour ce type
      const aExamenCode = examsCand.some(e => e.type === "Code" && e.status === "Scheduled");
      const aExamenCreneau = examsCand.some(e => e.type === "Créneau" && e.status === "Scheduled");
      const aExamenCirculation = examsCand.some(e => e.type === "Circulation" && e.status === "Scheduled");

      // Vérifie si reporté
      const rapportCandidat = candidatsReportes[cid];

      // --- GÉNÉRATION CODE ---
      if (
        nbSeances >= EXAM_THRESHOLDS.Code &&
        !aReussiCode &&
        !aExamenCode &&
        echecsCode < examRules.tentativesMax &&
        (!rapportCandidat || rapportCandidat.type !== "Code" || rapportCandidat.nextSuggestedDate <= today)
      ) {
        const lastExamDate = examsCand
          .filter(e => e.type === "Code" && e.status === "Failed")
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || today;

        const delai = echecsCode > 0 ? examRules.delaiApresEchec : 0;
        const nextDate = getNextExamDate(lastExamDate, examRules.joursAutorises, delai);

        nouveauxExamens.push({
          id: `auto-${cid}-Code-${Date.now()}-${Math.random()}`,
          candidatId: cid,
          candidat: `${candidat.prenom} ${candidat.nom}`,
          type: "Code",
          date: nextDate,
          heure: "08:00",
          lieu: "Centre d'examen",
          status: "Scheduled",
          autoGenerated: true,
          nbSeances,
          suggested: rapportCandidat?.type === "Code",
        });
      }

      // --- GÉNÉRATION CRÉNEAU ---
      if (
        nbSeances >= EXAM_THRESHOLDS.Créneau &&
        aReussiCode &&
        !aReussiCreneau &&
        !aExamenCreneau &&
        echecsCreneau < examRules.tentativesMax &&
        (!rapportCandidat || rapportCandidat.type !== "Créneau" || rapportCandidat.nextSuggestedDate <= today)
      ) {
        const lastExamDate = examsCand
          .filter(e => e.type === "Créneau" && e.status === "Failed")
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || today;

        const delai = echecsCreneau > 0 ? examRules.delaiApresEchec : 0;
        const nextDate = getNextExamDate(lastExamDate, examRules.joursAutorises, delai);

        nouveauxExamens.push({
          id: `auto-${cid}-Créneau-${Date.now()}-${Math.random()}`,
          candidatId: cid,
          candidat: `${candidat.prenom} ${candidat.nom}`,
          type: "Créneau",
          date: nextDate,
          heure: "09:00",
          lieu: "Auto-école",
          status: "Scheduled",
          autoGenerated: true,
          nbSeances,
          suggested: rapportCandidat?.type === "Créneau",
        });
      }

      // --- GÉNÉRATION CIRCULATION ---
      if (
        nbSeances >= EXAM_THRESHOLDS.Circulation &&
        aReussiCode &&
        aReussiCreneau &&
        !aExamenCirculation &&
        echecsCirculation < examRules.tentativesMax &&
        (!rapportCandidat || rapportCandidat.type !== "Circulation" || rapportCandidat.nextSuggestedDate <= today)
      ) {
        const lastExamDate = examsCand
          .filter(e => e.type === "Circulation" && e.status === "Failed")
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date || today;

        const delai = echecsCirculation > 0 ? examRules.delaiApresEchec : 0;
        const nextDate = getNextExamDate(lastExamDate, examRules.joursAutorises, delai);

        nouveauxExamens.push({
          id: `auto-${cid}-Circulation-${Date.now()}-${Math.random()}`,
          candidatId: cid,
          candidat: `${candidat.prenom} ${candidat.nom}`,
          type: "Circulation",
          date: nextDate,
          heure: "10:00",
          lieu: "Circuit principal",
          status: "Scheduled",
          autoGenerated: true,
          nbSeances,
          suggested: rapportCandidat?.type === "Circulation",
        });
      }
    });

    // Fusionne sans doublons (même candidatId + type déjà présent)
    setExamensList(prev => {
      const existing = prev.filter(e =>
        !nouveauxExamens.some(
          n => n.candidatId === e.candidatId && n.type === e.type && e.status === "Scheduled"
        )
      );
      return [...existing, ...nouveauxExamens];
    });
  };

  /** Met à jour le statut d'un examen (Passed/Failed/Scheduled) */
  const toggleExamenStatus = (id) => {
    setExamensList(prev => prev.map(e => {
      if (e.id !== id) return e;
      const cycle = ["Scheduled", "Passed", "Failed"];
      const next = cycle[(cycle.indexOf(e.status) + 1) % cycle.length];
      
      // Si l'examen passe à "Failed", on programme la prochaine suggestion
      if (next === "Failed") {
        const today = new Date().toISOString().split("T")[0];
        const nextDate = getNextExamDate(today, examRules.joursAutorises, examRules.delaiApresEchec);
        setCandidatsReportes(prev2 => ({
          ...prev2,
          [e.candidatId]: {
            type: e.type,
            nextSuggestedDate: nextDate,
            reason: "echec",
          }
        }));
      }
      return { ...e, status: next };
    }));
  };

  /**
   * Retire un candidat de la session actuelle
   * Il sera re-suggéré à la prochaine date d'examen
   */
  const retirerCandidat = (id) => {
    const examen = examensList.find(e => e.id === id);
    if (!examen) return;

    const today = new Date().toISOString().split("T")[0];
    const nextDate = getNextExamDate(today, examRules.joursAutorises, examRules.delaiApresEchec);

    // Enregistre le report
    setCandidatsReportes(prev => ({
      ...prev,
      [examen.candidatId]: {
        type: examen.type,
        nextSuggestedDate: nextDate,
        reason: "retire",
      }
    }));

    // Supprime de la liste active
    setExamensList(prev => prev.filter(e => e.id !== id));
  };

  /** Modifie manuellement un examen (date, heure, lieu) */
  const updateExamen = (id, changes) => {
    setExamensList(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e));
  };

  /** Retourne les candidats reportés avec leur prochaine date suggérée */
  const getCandidatsReportes = () => candidatsReportes;

  return (
    <ExamenContext.Provider value={{
      examensList,
      setExamensList,
      generateExamens,
      toggleExamenStatus,
      retirerCandidat,
      updateExamen,
      getCandidatsReportes,
      candidatsReportes,
      EXAM_THRESHOLDS,
    }}>
      {children}
    </ExamenContext.Provider>
  );
}

export const useExamenCtx = () => useContext(ExamenContext);