// src/renderer/context/ExamenRulesContext.jsx
import React, { createContext, useContext, useState } from "react";

const ExamenRulesContext = createContext(null);

const DEFAULT_EXAM_RULES = {
  delaiApresEchec: 14,
  tentativesMax: 3,
  blocageImpaye: true,
  joursAutorises: ["Lun", "Mer", "Ven"],
};

export function ExamenRulesProvider({ children }) {
  const [examRules, setExamRules] = useState(() => {
    try {
      const saved = localStorage.getItem("examRules");
      return saved
        ? { ...DEFAULT_EXAM_RULES, ...JSON.parse(saved) }
        : DEFAULT_EXAM_RULES;
    } catch {
      return DEFAULT_EXAM_RULES;
    }
  });

  const saveExamRules = (rules) => {
    setExamRules(rules);
    localStorage.setItem("examRules", JSON.stringify(rules));
  };

  return (
    <ExamenRulesContext.Provider value={{ examRules, saveExamRules }}>
      {children}
    </ExamenRulesContext.Provider>
  );
}

export const useExamenRulesCtx = () => useContext(ExamenRulesContext);