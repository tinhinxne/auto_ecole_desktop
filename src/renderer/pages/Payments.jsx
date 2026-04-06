import React, { useState } from "react";
import Card from "../components/Card";
import PaymentModal from "../components/PaymentModal";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { motion } from "framer-motion";
import "../../styles/payment.css";

const Payments = () => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("2024-04-13");
  const [endDate, setEndDate] = useState("2026-04-13");

  // Données factices (inchangées)
  const [paymentsData, setPaymentsData] = useState([
    { id: 1, name: "Marie Dubois", date: "2026-03-05", amount: "350 DA", type: "Complet", method: "Compte", total: 30000, paid: 10500, history: [] },
    { id: 2, name: "Pierre Martin", date: "2026-03-06", amount: "450 DA", type: "Complet", method: "Compte", total: 25000, paid: 12500, history: [] },
    { id: 3, name: "Sophie Leroy", date: "2026-03-07", amount: "200 DA", type: "Complet", method: "Compte", total: 28000, paid: 28000, history: [] },
    { id: 4, name: "Luc Bernard", date: "2026-03-08", amount: "350 DA", type: "Par tranche", method: "Par traiteur", total: 32000, paid: 12500, history: [] },
    { id: 5, name: "Emma Petit", date: "2026-02-28", amount: "550 DA", type: "Par tranche", method: "Par traiteur", total: 35000, paid: 15500, history: [] },
  ]);

  const handleAddPayment = (newPayment) => {
    // Ta logique de mise à jour (inchangée)
  };

  const handleDownload = (item) => {
    alert(`Téléchargement de la facture pour ${item.name}`);
  };

  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const paymentDate = new Date(payment.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return matchesSearch && paymentDate >= start && paymentDate <= end;
  });

  const th = { padding: "15px 16px", textAlign: "left", color: "#fff", fontWeight: "600", fontSize: "14px" };
  const td = { padding: "14px 16px", borderBottom: "1px solid #E5E7EB", fontSize: "14px", color: "#1F2937" };

  return (
    <div className="container">
      <div className="main">
        {/* HEADER */}
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} /> Gestion des Encaissements
          </h1>
          <p>Suivi de la performance financière de l'auto-école</p>
        </div>

        {/* --- SECTION CARDS SANS ICONES --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "30px",
            marginTop: "20px"
          }}
        >
          {[
            { title: "Chiffre d'Affaires", value: "450.000 DA", detail: "Encaissé ce mois", color: "#4E96E1" },
            { title: "Prévisions d'Entrée", value: "185.000 DA", detail: "Tranches à venir", color: "#011659" },
            { title: "Taux de Recouvrement", value: "82%", detail: "Globalité des dossiers", color: "#166534" }
          ].map((card, index) => (
            <div
              key={index}
              style={{
                background: "#DDE2EF",
                borderRadius: "16px",
                padding: "24px",
                borderLeft: `6px solid ${card.color}`, // Accent de couleur sur le côté
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {card.title}
              </p>
              <h2 style={{ margin: "8px 0", fontSize: "26px", fontWeight: "800", color: "#1e293b" }}>
                {card.value}
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: card.color, fontWeight: "600" }}>
                {card.detail}
              </p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ background: "#fff", padding: "15px 20px", borderRadius: "15px", marginBottom: "20px", display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap", border: `1px solid #011659` }}>
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: "10px", border: `1px solid #4E96E1`, borderRadius: "10px", outline: "none" }}
          />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "10px", border: `1px solid #4E96E1`, borderRadius: "10px" }} />
          <span>à</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "10px", border: `1px solid #4E96E1`, borderRadius: "10px" }} />
        </div>

        {/* TABLE */}
        <div style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#4E96E1" }}>
                  <th style={th}>Candidat</th>
                  <th style={th}>Date de paiement</th>
                  <th style={th}>Montant</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Méthode</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{ background: index % 2 === 0 ? "#fff" : "#F0F4F9", cursor: "pointer" }}
                    onClick={() => { setSelected(item); setShowModal(true); }}
                  >
                    <td style={td}>{item.name}</td>
                    <td style={td}>{item.date}</td>
                    <td style={td}>{item.amount}</td>
                    <td style={td}>
                      <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: item.type === "Complet" ? "#DCFCE7" : "#FEF3C7",
                          color: item.type === "Complet" ? "#166534" : "#9B2C1D",
                        }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={td}>{item.method}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(item); setShowModal(true); }}
                          style={{ background: "#4E96E1", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Gérer
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                          style={{ padding: "6px 14px", background: "#011659", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Facture
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {showModal && selected && (
          <PaymentModal
            candidate={selected}
            onClose={() => { setShowModal(false); setSelected(null); }}
            onAddPayment={handleAddPayment}
          />
        )}
      </div>
    </div>
  );
};

export default Payments;