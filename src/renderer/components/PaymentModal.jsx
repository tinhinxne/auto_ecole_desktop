import React, { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

const PaymentModal = ({ candidate, allCandidates, onClose, onAddPayment }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(candidate || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListOpen, setIsListOpen] = useState(false); // État pour ouvrir/fermer la liste
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState({});

  // Filtrage dynamique
  const filteredCandidates = allCandidates?.filter(c => 
    `${c.prenom} ${c.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentRemaining = selectedCandidate ? (selectedCandidate.montantRestant ?? 30000) : 0;
  const liveRemaining = currentRemaining - (parseFloat(amount) || 0);

  const paymentMethods = [
    { value: "", label: "Méthode de Paiement" },
    { value: "especes", label: "Espèces" },
    { value: "ccp", label: "CCP" },
    { value: "carte", label: "Carte" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!selectedCandidate) newErrors.candidate = "Veuillez choisir un candidat";
    if (!paymentType) newErrors.paymentType = "La méthode est requise";
    if (!amount || amount <= 0) newErrors.amount = "Montant invalide";
    if (!date) newErrors.date = "La date est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddPayment({
        idCandidat: selectedCandidate.idCandidat,
        montant: parseFloat(amount),
        methode: paymentType,
        dateVersement: date,
        remarque: remark,
        typeVersement: 'seance'
      });
    }
  };

  // STYLES (Conservés + ajouts pour la liste)
  const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
  const modalContent = { background: "#fff", borderRadius: "20px", width: "90%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" };
  const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", borderRadius: "20px 20px 0 0" };
  const modalBody = { padding: "24px" };
  const sectionTitle = { fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "16px", marginTop: "24px" };
  const candidateBadge = { padding: "12px", background: "#EBF5FF", borderRadius: "12px", border: "1px solid #4E96E1", marginBottom: "15px" };
  
  const dropdownIcon = {
    position: "absolute",
    right: "15px",
    top: "42px",
    cursor: "pointer",
    fontSize: "18px",
    color: "#2b537e",
    transition: "transform 0.2s"
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h3 style={{ margin: 0 }}>{candidate ? "Détails du paiement" : "Nouveau Versement"}</h3>
          <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }} onClick={onClose}>✕</button>
        </div>

        <div style={modalBody}>
          {!candidate && !selectedCandidate ? (
            <div style={{ position: "relative" }}>
              <Input 
                label="🔍 Rechercher un candidat *"
                placeholder="Taper le nom ou prénom..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if(!isListOpen) setIsListOpen(true);
                }}
                error={errors.candidate}
              />
              {/* Icône de flèche pour ouvrir/fermer la liste */}
              <div 
                style={{...dropdownIcon, transform: isListOpen ? "rotate(180deg)" : "rotate(0deg)"}}
                onClick={() => setIsListOpen(!isListOpen)}
              >
                ▼
              </div>

              {isListOpen && (
                <div style={{ 
                  maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", 
                  borderRadius: "10px", marginTop: "-10px", background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", position: "absolute",
                  width: "100%", zIndex: 100
                }}>
                  {filteredCandidates?.length > 0 ? (
                    filteredCandidates.map(c => (
                      <div 
                        key={c.idCandidat}
                        onClick={() => { 
                            setSelectedCandidate(c); 
                            setSearchQuery(""); 
                            setIsListOpen(false);
                        }}
                        style={{ padding: "12px", borderBottom: "1px solid #eee", cursor: "pointer", fontWeight: "500" }}
                        onMouseEnter={(e) => e.target.style.background = "#f0f7ff"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                      >
                        {c.prenom} {c.nom}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px", color: "#888", textAlign: "center" }}>Aucun candidat trouvé</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={candidateBadge}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", color: "#2b537e" }}>
                    Candidat : {selectedCandidate.prenom} {selectedCandidate.nom}
                  </div>
                  <div style={{ fontSize: "13px", marginTop: "5px" }}>
                    Reste à payer : <span style={{ fontWeight: "bold" }}>{currentRemaining} DA</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px" }}>Nouveau reste :</div>
                  <div style={{ fontWeight: "800", color: liveRemaining <= 0 ? "#166534" : "#b91c1c" }}>
                    {liveRemaining} DA
                  </div>
                </div>
              </div>
              {!candidate && (
                <button onClick={() => { setSelectedCandidate(null); setIsListOpen(false); }} style={{ background: "none", border: "none", color: "#4E96E1", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0, marginTop: "10px" }}>
                  Changer de candidat
                </button>
              )}
            </div>
          )}

          <div style={sectionTitle}>Informations du versement</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <Select label="Méthode *" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} options={paymentMethods} error={errors.paymentType} />
            <Input label="Montant (DA) *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 5000" error={errors.amount} />
          </div>

          <Input label="Date du versement *" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
          <Input label="Remarque" type="text" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Ex: Tranche 2..." textarea rows={2} />

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</Button>
            <Button variant="primary" onClick={handleSubmit} style={{ flex: 2 }}>Enregistrer le paiement</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;