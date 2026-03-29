import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import PaymentModal from "../components/PaymentModal";
import bgImage from "../../assets/Connexion.png";

const Payments = () => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("2024-04-13");
  const [endDate, setEndDate] = useState("2026-04-13");

  const [paymentsData, setPaymentsData] = useState([
    {
      id: 1,
      name: "Marie Dubois",
      date: "2026-03-05",
      amount: "350 DA",
      type: "Complet",
      method: "Compte",
      total: 30000,
      paid: 10500,
      history: [
        { id: 1, date: "2026-03-05", amount: "350 DA", method: "Compte", remark: "Premier versement" },
        { id: 2, date: "2026-02-20", amount: "3500 DA", method: "Espèces", remark: "Deuxième versement" },
        { id: 3, date: "2026-01-10", amount: "3500 DA", method: "Chèque", remark: "Versement initial" },
      ],
    },
    {
      id: 2,
      name: "Pierre Martin",
      date: "2026-03-06",
      amount: "450 DA",
      type: "Complet",
      method: "Compte",
      total: 25000,
      paid: 12500,
      history: [
        { id: 1, date: "2026-03-06", amount: "450 DA", method: "Compte", remark: "Paiement partiel" },
        { id: 2, date: "2026-02-15", amount: "5000 DA", method: "Espèces", remark: "Versement" },
        { id: 3, date: "2026-01-20", amount: "5000 DA", method: "Virement", remark: "Accompte" },
      ],
    },
    {
      id: 3,
      name: "Sophie Leroy",
      date: "2026-03-07",
      amount: "200 DA",
      type: "Complet",
      method: "Compte",
      total: 28000,
      paid: 28000,
      history: [
        { id: 1, date: "2026-03-07", amount: "200 DA", method: "Compte", remark: "Solde final" },
        { id: 2, date: "2026-02-20", amount: "10000 DA", method: "Espèces", remark: "Deuxième versement" },
        { id: 3, date: "2026-01-10", amount: "11000 DA", method: "Virement", remark: "Premier versement" },
      ],
    },
    {
      id: 4,
      name: "Luc Bernard",
      date: "2026-03-08",
      amount: "350 DA",
      type: "Par tranche",
      method: "Par traiteur",
      total: 32000,
      paid: 12500,
      history: [
        { id: 1, date: "2026-03-08", amount: "350 DA", method: "Par traiteur", remark: "Versement mensuel" },
        { id: 2, date: "2026-02-05", amount: "4500 DA", method: "Espèces", remark: "Deuxième versement" },
        { id: 3, date: "2026-01-10", amount: "4500 DA", method: "Chèque", remark: "Premier versement" },
      ],
    },
    {
      id: 5,
      name: "Emma Petit",
      date: "2026-02-28",
      amount: "550 DA",
      type: "Par tranche",
      method: "Par traiteur",
      total: 35000,
      paid: 15500,
      history: [
        { id: 1, date: "2026-02-28", amount: "550 DA", method: "Par traiteur", remark: "Versement" },
        { id: 2, date: "2026-01-15", amount: "5000 DA", method: "Espèces", remark: "Deuxième versement" },
        { id: 3, date: "2026-01-05", amount: "5000 DA", method: "Chèque", remark: "Premier versement" },
      ],
    },
  ]);

  const stats = {
    totalRevenue: "1000 DA",
    pendingPayments: "350 DA",
    latePayments: "550 DA",
  };

  const handleAddPayment = (newPayment) => {
    const updatedData = paymentsData.map((item) => {
      if (item.id === selected.id) {
        const newAmount = newPayment.amount;
        const currentPaid = parseFloat(item.paid);
        const newTotalPaid = currentPaid + newAmount;
        
        const newHistory = [
          {
            id: item.history.length + 1,
            date: newPayment.date,
            amount: newPayment.amount + " DA",
            method: newPayment.type,
            remark: newPayment.remark || "Nouveau paiement",
          },
          ...item.history,
        ];

        const total = parseFloat(item.total);
        const type = newTotalPaid >= total ? "Complet" : "Par tranche";

        return {
          ...item,
          paid: newTotalPaid,
          type: type,
          history: newHistory,
          amount: newPayment.amount + " DA",
          date: newPayment.date,
          method: newPayment.type,
        };
      }
      return item;
    });

    setPaymentsData(updatedData);
    setSelected(updatedData.find((item) => item.id === selected.id));
  };

  const handleDownload = (item) => {
    alert(`Téléchargement de la facture pour ${item.name}`);
  };

  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const paymentDate = new Date(payment.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const matchesDateRange = paymentDate >= start && paymentDate <= end;
    return matchesSearch && matchesDateRange;
  });

  const th = {
    padding: "15px 16px",
    textAlign: "left",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
  };

  const td = {
    padding: "14px 16px",
    borderBottom: "1px solid #E5E7EB",
    fontSize: "14px",
    color: "#1F2937",
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F0F4F9" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {/* HEADER IMAGE */}
        <div
          style={{
            background: `url(${bgImage})`,
            height: "180px",
            borderRadius: "20px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginBottom: "20px",
          }}
        />

        <h2 style={{ marginBottom: "10px", color: "#333" }}>Paiements et factures</h2>
        <p style={{ color: "#777", marginBottom: "20px" }}>
          Suivre les paiements et gérer les factures
        </p>

        {/* STATS CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <Card
            title="Revenu total"
            value={stats.totalRevenue}
            period="Ce mois"
            color="#333"
            bgColor="#F1F5F9"
            strokeColor="#011659"
          />
          <Card
            title="Paiements en attente"
            value={stats.pendingPayments}
            period="En attente de confirmation"
            color="#ff9800"
            bgColor="#F1F5F9"
            strokeColor="#011659"
          />
          <Card
            title="Paiements en retard"
            value={stats.latePayments}
            period="Nécessite une attention"
            color="#dc3545"
            bgColor="#F1F5F9"
            strokeColor="#011659"
          />
        </div>

        {/* FILTERS */}
        <div
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "15px",
            marginBottom: "20px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap",
            border: `1px solid #011659`,
          }}
        >
          <input
            type="text"
            placeholder="Search by candidate or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              border: `1px solid #4E96E1`,
              borderRadius: "10px",
              outline: "none",
            }}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "10px",
              border: `1px solid #4E96E1`,
              borderRadius: "10px",
            }}
          />
          <span>à</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "10px",
              border: `1px solid #4E96E1`,
              borderRadius: "10px",
            }}
          />
          <button
            style={{
              padding: "10px 20px",
              background: "#011659",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#022073";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#011659";
            }}
          >
            Filtrer
          </button>
        </div>

        {/* TABLE */}
        <div
          style={{
            background: "#fff",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#4E96E1" }}>
                  <th style={th}>Candidat</th>
                  <th style={th}>Date de paiement</th>
                  <th style={th}>Montant</th>
                  <th style={th}>Type</th>
                  <th style={th}>Méthode</th>
                  <th style={th}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredPayments.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      background: index % 2 === 0 ? "#fff" : "#F0F4F9",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#E6F0FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#F0F4F9";
                    }}
                    onClick={() => {
                      setSelected(item);
                      setShowModal(true);
                    }}
                  >
                    <td style={td}>{item.name}</td>
                    <td style={td}>{item.date}</td>
                    <td style={td}>{item.amount}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: item.type === "Complet" ? "#DCFCE7" : "#FEF3C7",
                          color: item.type === "Complet" ? "#166534" : "#9B2C1D",
                        }}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td style={td}>{item.method}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item);
                            setShowModal(true);
                          }}
                          style={{
                            background: "#4E96E1",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#3A7BC8";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#4E96E1";
                          }}
                        >
                          Gérer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          style={{
                            padding: "6px 14px",
                            background: "#011659",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#022073";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#011659";
                          }}
                        >
                          Télécharger
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
            onClose={() => {
              setShowModal(false);
              setSelected(null);
            }}
            onAddPayment={handleAddPayment}
          />
        )}
      </div>
    </div>
  );
};

export default Payments;