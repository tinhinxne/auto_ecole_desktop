import React, { useState, useEffect, useCallback } from "react";
import { FaLock } from "react-icons/fa";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { useAuth } from "../context/AuthContext";
import { useMyPermissions } from "../context/PermissionsContext";
import "../../styles/payment.css";

// ── Tooltip verrou ─────────────────────────────────────────────────────────────
function LockedTooltip({ children, message = "Permission requise par l'admin" }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: "absolute", bottom: "110%", left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b", color: "#fff",
          padding: "7px 13px", borderRadius: 8,
          fontSize: "0.72rem", fontWeight: 500,
          whiteSpace: "nowrap", zIndex: 999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}>
          🔒 {message}
          <div style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)", width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #1e293b",
          }} />
        </div>
      )}
    </div>
  );
}

// ── Bannière d'action refusée ─────────────────────────────────────────────────
function LockedBanner({ message, onClose }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 20px",
      background: "linear-gradient(90deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02))",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 10, marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.8rem", color: "#b91c1c" }}>
        <FaLock />
        <strong>Action non autorisée</strong> — {message}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
    </div>
  );
}

// ── Page Paiements (vue Moniteur) ──────────────────────────────────────────────
const PaiementsMoniteur = () => {
  // ── Permissions dynamiques depuis le contexte ──────────────────────────────
  const { currentUser } = useAuth();
  const { CAN_ADD_PAYMENT, CAN_VIEW_ALL_CANDIDATES } = useMyPermissions();

  // Nom affiché dans le header
  const CURRENT_MONITEUR = currentUser
    ? `${currentUser.prenom} ${currentUser.nom}`
    : "Moniteur";

  const [searchTerm, setSearchTerm]     = useState("");
  const [startDate, setStartDate]       = useState("2024-01-01");
  const [endDate, setEndDate]           = useState("2026-12-31");
  const [lockedBanner, setLockedBanner] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [stats, setStats] = useState({ total: "0 DA", enAttente: "0 DA", taux: "0%" });

  // ── Chargement des données ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const payments = await window.electron.getPayments();

      // Si CAN_VIEW_ALL_CANDIDATES → on affiche tout
      // Sinon → uniquement les paiements liés à ce moniteur (par moniteur_id)
      const myPayments = CAN_VIEW_ALL_CANDIDATES
        ? (payments || [])
        : (payments || []).filter(p => p.moniteur_id === currentUser?.id);

      setPaymentsData(myPayments);

      // Calcul des stats
      const totalEncaisse = myPayments.reduce((acc, p) => acc + (p.montant || 0), 0);
      const totalRestant  = myPayments.reduce((acc, p) => acc + (p.montantRestant || 0), 0);
      const taux = myPayments.length > 0
        ? Math.round(
            (myPayments.filter(p => p.montantRestant === 0).length / myPayments.length) * 100
          )
        : 0;

      setStats({
        total:     `${totalEncaisse.toLocaleString("fr-DZ")} DA`,
        enAttente: `${totalRestant.toLocaleString("fr-DZ")} DA`,
        taux:      `${taux}%`,
      });
    } catch (err) {
      console.error("Erreur lors du chargement des paiements :", err);
      // Données de fallback pour le développement sans Electron
      const fallback = [
        { idVersement: 1, prenom: "Karima", nom: "Alhane",  dateVersement: "2026-03-10", montant: 8000,  montantRestant: 4000, methode: "espèces",  moniteur_id: currentUser?.id },
        { idVersement: 2, prenom: "Bssad",  nom: "Omar",    dateVersement: "2026-03-12", montant: 12000, montantRestant: 0,    methode: "virement", moniteur_id: currentUser?.id },
        { idVersement: 3, prenom: "Nassima",nom: "Oukili",  dateVersement: "2026-03-05", montant: 5000,  montantRestant: 7000, methode: "espèces",  moniteur_id: currentUser?.id },
      ];
      setPaymentsData(fallback);
      setStats({ total: "25 000 DA", enAttente: "11 000 DA", taux: "33%" });
    }
  }, [CAN_VIEW_ALL_CANDIDATES, currentUser?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Action verrouillée ─────────────────────────────────────────────────────
  const handleAddPayment = () => {
    if (!CAN_ADD_PAYMENT) {
      setLockedBanner("L'ajout de paiements est réservé aux administrateurs. Contactez votre admin pour obtenir cette permission.");
      return;
    }
    // TODO : ouvrir la modal d'ajout de paiement si permission accordée
  };

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const filteredPayments = paymentsData.filter((payment) => {
    const fullName    = `${payment.prenom || ""} ${payment.nom || ""}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase());
    const paymentDate = new Date(payment.dateVersement);
    const matchDate   =
      (!startDate || paymentDate >= new Date(startDate)) &&
      (!endDate   || paymentDate <= new Date(endDate));
    return matchSearch && matchDate;
  });

  // ── Styles ────────────────────────────────────────────────────────────────
  const th = { padding: "15px 16px", textAlign: "left", color: "#fff", fontWeight: "600", fontSize: "14px" };
  const td = { padding: "14px 16px", borderBottom: "1px solid #E5E7EB", fontSize: "14px", color: "#1F2937" };

  return (
    <div className="container">
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="icon" width={40} style={{ marginRight: "10px" }} />
            Suivi des Paiements
          </h1>
          <p>
            {CAN_VIEW_ALL_CANDIDATES
              ? "Vue complète — tous les candidats"
              : `Versements de mes candidats — ${CURRENT_MONITEUR}`}
          </p>
        </div>

        {/* Bannière verrou */}
        {lockedBanner && (
          <LockedBanner message={lockedBanner} onClose={() => setLockedBanner(null)} />
        )}

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px", marginTop: "20px" }}>
          {[
            { title: CAN_VIEW_ALL_CANDIDATES ? "Encaissé (tous)" : "Encaissé (mes candidats)", value: stats.total,     color: "#2b537e", detail: "Total reçu" },
            { title: "Reste à recouvrer",                                                        value: stats.enAttente, color: "#011659", detail: "Soldes en attente" },
            { title: "Taux de recouvrement",                                                     value: stats.taux,      color: "#166534", detail: "Dossiers soldés" },
          ].map((card, i) => (
            <div key={i} style={{
              background: "#DDE2EF",
              borderRadius: "16px",
              padding: "24px",
              borderLeft: `6px solid ${card.color}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>{card.title}</p>
              <h2 style={{ margin: "8px 0", fontSize: "26px", fontWeight: "800", color: "#1e293b" }}>{card.value}</h2>
              <p style={{ margin: 0, fontSize: "13px", color: card.color, fontWeight: "600" }}>{card.detail}</p>
            </div>
          ))}
        </div>

        {/* FILTRES & BOUTON */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "center" }}>
          <div style={{
            flex: 1, background: "#fff", padding: "12px 20px",
            borderRadius: "15px", display: "flex", gap: "15px",
            alignItems: "center", border: "1px solid #E2E8F0",
          }}>
            <input
              type="text"
              placeholder="🔍 Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: "10px", border: "1px solid #CBD5E0", borderRadius: "10px", outline: "none" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4A5568" }}>
              <span>Du</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "8px", border: "1px solid #CBD5E0", borderRadius: "8px" }} />
              <span>au</span>
              <input type="date" value={endDate}   onChange={(e) => setEndDate(e.target.value)}   style={{ padding: "8px", border: "1px solid #CBD5E0", borderRadius: "8px" }} />
            </div>
          </div>

          {/* Bouton Nouveau Paiement — verrouillé si pas de permission */}
          {CAN_ADD_PAYMENT ? (
            <button
              onClick={handleAddPayment}
              style={{
                background: "#166534", color: "#fff", border: "none",
                padding: "15px 25px", borderRadius: "12px", cursor: "pointer",
                fontWeight: "700", boxShadow: "0 4px 6px rgba(22,101,52,0.2)",
              }}
            >
              + Nouveau Paiement
            </button>
          ) : (
            <LockedTooltip message="Ajout de paiement réservé à l'admin">
              <button
                onClick={handleAddPayment}
                style={{
                  background: "#e2e8f0", color: "#94a3b8",
                  border: "1px solid #cbd5e1",
                  padding: "15px 25px", borderRadius: "12px",
                  cursor: "not-allowed", fontWeight: "700",
                  display: "flex", alignItems: "center", gap: 8,
                  filter: "grayscale(1)", userSelect: "none",
                }}
              >
                <FaLock style={{ fontSize: 12 }} />
                + Nouveau Paiement
              </button>
            </LockedTooltip>
          )}
        </div>

        {/* Badge vue */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: CAN_ADD_PAYMENT ? "rgba(22,101,52,0.08)" : "rgba(148,163,184,0.12)",
          border: `1px solid ${CAN_ADD_PAYMENT ? "rgba(22,101,52,0.25)" : "#e2e8f0"}`,
          borderRadius: 10, padding: "6px 14px",
          fontSize: "0.75rem",
          color: CAN_ADD_PAYMENT ? "#166534" : "#64748b",
          fontWeight: 600, marginBottom: 14,
        }}>
          {CAN_ADD_PAYMENT
            ? <><span>✅</span> Paiements — modification autorisée</>
            : <><FaLock style={{ fontSize: 10 }} /> Vue lecture seule — contactez l'admin pour ajouter ou modifier des paiements</>
          }
        </div>

        {/* TABLEAU */}
        <div style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr style={{ background: "#2b537e" }}>
                  <th style={th}>Candidat</th>
                  <th style={th}>Date versement</th>
                  <th style={th}>Montant</th>
                  <th style={th}>Reste à payer</th>
                  <th style={th}>Méthode</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((item, index) => (
                    <tr key={item.idVersement || index} style={{ background: index % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                      <td style={td}>{item.prenom} {item.nom}</td>
                      <td style={td}>{new Date(item.dateVersement).toLocaleDateString("fr-FR")}</td>
                      <td style={td}><strong style={{ color: "#2D3748" }}>{item.montant?.toLocaleString("fr-DZ")} DA</strong></td>
                      <td style={td}>
                        <span style={{
                          color: item.montantRestant > 0 ? "#b91c1c" : "#059669",
                          fontWeight: "bold",
                          background: item.montantRestant > 0 ? "#FEF2F2" : "#ECFDF5",
                          padding: "4px 10px", borderRadius: "20px",
                        }}>
                          {item.montantRestant?.toLocaleString("fr-DZ")} DA
                        </span>
                      </td>
                      <td style={{ ...td, textTransform: "capitalize" }}>{item.methode}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#A0AEC0" }}>
                      Aucun versement trouvé pour cette période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaiementsMoniteur;