import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const PERMS_DEFAUT = {
  CAN_ADD_SESSION: true,
  CAN_ADD_PAYMENT: false,
  CAN_TOGGLE_STATUS: false,
  CAN_REMOVE_CANDIDAT: false,
  CAN_VIEW_ALL_CANDIDATES: false,
};

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  // Structure stockée : { "42": { CAN_ADD_SESSION: true, ... }, "17": {...}, ... }
  // La clé est l'id (numérique) du moniteur dans la BDD
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem("moniteur_permissions");
    return saved ? JSON.parse(saved) : {};
  });

  // Appelé par l'admin dans Paramètres pour modifier les perms d'un moniteur
  const updatePermissions = (moniteurId, newPerms) => {
    setPermissions(prev => {
      const updated = {
        ...prev,
        [moniteurId]: { ...PERMS_DEFAUT, ...prev[moniteurId], ...newPerms }
      };
      localStorage.setItem("moniteur_permissions", JSON.stringify(updated));
      return updated;
    });
  };

  // Retourne les permissions d'un moniteur précis
  const getPermissions = (moniteurId) =>
    permissions[moniteurId] ?? { ...PERMS_DEFAUT };

  return (
    <PermissionsContext.Provider value={{ permissions, updatePermissions, getPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissionsCtx = () => useContext(PermissionsContext);

// Hook pour les pages moniteur : lit l'id du connecté automatiquement
export function useMyPermissions() {
  const { currentUser } = useAuth();
  const { getPermissions } = usePermissionsCtx();
  if (!currentUser) return { ...PERMS_DEFAUT };
  return getPermissions(currentUser.id); // id = celui de la BDD
}