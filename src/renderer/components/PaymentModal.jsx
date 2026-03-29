import React, { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

const PaymentModal = ({ candidate, onClose, onAddPayment }) => {
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: "", label: "Type de Paiement" },
    { value: "Espèces", label: "Espèces" },
    { value: "Carte bancaire", label: "Carte bancaire" },
    { value: "Virement", label: "Virement" },
    { value: "Chèque", label: "Chèque" },
    { value: "Par tranche", label: "Par tranche" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!paymentType) newErrors.paymentType = "Le type de paiement est requis";
    if (!amount) newErrors.amount = "Le montant est requis";
    else if (parseFloat(amount) <= 0) newErrors.amount = "Le montant doit être supérieur à 0";
    if (!date) newErrors.date = "La date est requise";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddPayment({
        type: paymentType,
        amount: parseFloat(amount),
        date: date,
        remark: remark,
      });
      setPaymentType("");
      setAmount("");
      setRemark("");
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      onClose();
    }
  };

  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContent = {
    background: "#fff",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "550px",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const modalHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #E5E7EB",
    background: "#F9FAFB",
    borderRadius: "20px 20px 0 0",
  };

  const modalTitle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  };

  const closeButton = {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6B7280",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "all 0.2s",
  };

  const modalBody = {
    padding: "24px",
  };

  const candidateName = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4E96E1",
    marginBottom: "12px",
  };

  const infoText = {
    fontSize: "14px",
    color: "#374151",
    marginBottom: "8px",
  };

  const sectionTitle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "16px",
    marginTop: "24px",
  };

  const formRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  };

  const buttonGroup = {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  };

  const historyTable = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "12px",
  };

  const tableHeader = {
    background: "#F9FAFB",
    padding: "10px 12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6B7280",
    borderBottom: "1px solid #E5E7EB",
  };

  const tableCell = {
    padding: "10px 12px",
    fontSize: "13px",
    color: "#374151",
    borderBottom: "1px solid #F3F4F6",
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h3 style={modalTitle}>Détails du paiement de {candidate?.name}</h3>
          <button
            style={closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = "#F3F4F6";
              e.target.style.color = "#111827";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none";
              e.target.style.color = "#6B7280";
            }}
          >
            ✕
          </button>
        </div>

        <div style={modalBody}>
          <div style={candidateName}>{candidate?.name}</div>
          
          <div style={infoText}>Total : {candidate?.total?.toLocaleString()} DA</div>
          <div style={infoText}>Total Payé : {candidate?.paid?.toLocaleString()} DA</div>

          <div style={sectionTitle}>Ajouter un paiement</div>
          
          <div style={formRow}>
            <Select
              label="Type de paiement *"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              options={paymentMethods}
              placeholder="Type de Paiement"
              required
              error={errors.paymentType}
            />
            <Input
              label="Montant *"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0 DA"
              required
              error={errors.amount}
            />
          </div>

          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            error={errors.date}
          />

          <Input
            label="Remarque"
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Ajouter une remarque..."
            textarea
            rows={3}
          />

          <div style={buttonGroup}>
            <Button variant="secondary" onClick={handleDelete}>
              Supprimer
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Enregistrer
            </Button>
          </div>

          <div style={sectionTitle}>Historique des paiements</div>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            <table style={historyTable}>
              <thead>
                <tr>
                  <th style={tableHeader}>Date</th>
                  <th style={tableHeader}>Type de paiement</th>
                  <th style={tableHeader}>Montant</th>
                  <th style={tableHeader}>Remarque</th>
                </tr>
              </thead>
              <tbody>
                {candidate?.history?.map((payment, index) => (
                  <tr key={payment.id || index}>
                    <td style={tableCell}>{payment.date}</td>
                    <td style={tableCell}>{payment.method}</td>
                    <td style={tableCell}>{payment.amount}</td>
                    <td style={tableCell}>{payment.remark}</td>
                  </tr>
                ))}
                {(!candidate?.history || candidate.history.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{ ...tableCell, textAlign: "center", color: "#9CA3AF" }}>
                      Aucun paiement enregistré
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

export default PaymentModal;