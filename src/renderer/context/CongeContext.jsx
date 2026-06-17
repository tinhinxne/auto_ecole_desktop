// src/renderer/context/CongeContext.jsx
// Gère UNIQUEMENT les congés personnels des moniteurs (date début → fin + raison).
// Le congé annuel de l'auto-école reste dans ExamenRulesContext (congeActif, congeMoisDebut, congeMoisFin).
import React, { createContext, useContext, useState } from "react";

const CongeContext = createContext(null);

export function CongeProvider({ children }) {
  // Structure : { [moniteurId]: [ { id, dateDebut, dateFin, raison }, ... ] }
  const [congesMoniteurs, setCongesMoniteurs] = useState(() => {
    try {
      const saved = localStorage.getItem("congesMoniteurs");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const _persist = (data) => {
    setCongesMoniteurs(data);
    localStorage.setItem("congesMoniteurs", JSON.stringify(data));
  };

  /** Ajouter un congé pour un moniteur */
  const addCongeMoniteur = (moniteurId, conge) => {
    const current = congesMoniteurs[moniteurId] || [];
    _persist({ ...congesMoniteurs, [moniteurId]: [...current, { ...conge, id: Date.now() }] });
  };

  /** Supprimer un congé par son id */
  const removeCongeMoniteur = (moniteurId, congeId) => {
    const current = congesMoniteurs[moniteurId] || [];
    _persist({ ...congesMoniteurs, [moniteurId]: current.filter(c => c.id !== congeId) });
  };

  /** Récupérer tous les congés d'un moniteur */
  const getCongesMoniteur = (moniteurId) => congesMoniteurs[moniteurId] || [];

  /**
   * Vérifie si un moniteur est en congé personnel à une date donnée.
   * @param {number|string} moniteurId
   * @param {Date|string} date  — défaut : aujourd'hui
   */
  const isMoniteurEnConge = (moniteurId, date = new Date()) => {
    const d = new Date(date);
    return (congesMoniteurs[moniteurId] || []).some(c => {
      const debut = new Date(c.dateDebut); debut.setHours(0, 0, 0, 0);
      const fin   = new Date(c.dateFin);   fin.setHours(23, 59, 59, 999);
      return d >= debut && d <= fin;
    });
  };

  /**
   * Retourne le congé personnel actif d'un moniteur à une date donnée, ou null.
   */
  const getCongeActifMoniteur = (moniteurId, date = new Date()) => {
    const d = new Date(date);
    return (congesMoniteurs[moniteurId] || []).find(c => {
      const debut = new Date(c.dateDebut); debut.setHours(0, 0, 0, 0);
      const fin   = new Date(c.dateFin);   fin.setHours(23, 59, 59, 999);
      return d >= debut && d <= fin;
    }) || null;
  };

  return (
    <CongeContext.Provider value={{
      congesMoniteurs,
      addCongeMoniteur,
      removeCongeMoniteur,
      getCongesMoniteur,
      isMoniteurEnConge,
      getCongeActifMoniteur,
    }}>
      {children}
    </CongeContext.Provider>
  );
}

export const useCongeCtx = () => useContext(CongeContext);