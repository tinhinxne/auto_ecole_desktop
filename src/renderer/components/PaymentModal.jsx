import React, { useState, useEffect } from "react";

import Button from "./Button";

import Input from "./Input";

import Select from "./Select";



const PRIX_PERMIS = 30000;



const PaymentModal = ({ candidate, allCandidates, onClose, onAddPayment }) => {

  const [selectedCandidate, setSelectedCandidate] = useState(candidate || null);

  const [candidatesList, setCandidatesList]       = useState([]);

  const [paymentType, setPaymentType]             = useState("");

  const [amount, setAmount]                       = useState("");

  const [date, setDate]                           = useState(new Date().toISOString().split("T")[0]);

  const [remark, setRemark]                       = useState("");

  const [errors, setErrors]                       = useState({});

  const [loading, setLoading]                     = useState(false);



  // ✅ Charger les candidats directement depuis l'IPC au montage

  // → On essaie getCandidatsDebiteurs en premier, sinon fallback sur getCandidats

  useEffect(() => {

    const loadCandidates = async () => {

      setLoading(true);

      try {

        // Essai 1 : getCandidatsDebiteurs (candidats avec reste > 0)

        if (window.electron.getCandidatsDebiteurs) {

          const debiteurs = await window.electron.getCandidatsDebiteurs();

          if (debiteurs && debiteurs.length > 0) {

            setCandidatesList(debiteurs);

            setLoading(false);

            return;

          }

        }

        // Fallback : tous les candidats si la liste débiteurs est vide ou inexistante

        if (window.electron.getCandidats) {

          const tous = await window.electron.getCandidats();

          const normalises = (tous || []).map(c => ({

            idCandidat:     c.idCandidat || c.id,

            nom:            c.nom,

            prenom:         c.prenom,

            telephone:      c.telephone || c.tel,

            montantRestant: c.montantRestant ?? PRIX_PERMIS,

            statutPaiement: c.statutPaiement || "en_attente",

          }));

          setCandidatesList(normalises);

        }

      } catch (err) {

        console.error("Erreur chargement candidats dans PaymentModal :", err);

        setCandidatesList(allCandidates || []);

      } finally {

        setLoading(false);

      }

    };



    if (!candidate) loadCandidates();

  }, []);



  const currentRemaining = selectedCandidate

    ? parseFloat(selectedCandidate.montantRestant ?? PRIX_PERMIS)

    : 0;



  const liveRemaining = Math.max(0, currentRemaining - (parseFloat(amount) || 0));

  const pctPaye       = PRIX_PERMIS > 0

    ? Math.round(((PRIX_PERMIS - currentRemaining) / PRIX_PERMIS) * 100)

    : 0;



  const candidateOptions = [

    { value: "", label: loading ? "Chargement..." : "── Choisir un candidat ──" },

    ...candidatesList.map(c => ({

      value: String(c.idCandidat),

      label: `${c.prenom} ${c.nom}  —  Reste : ${parseFloat(c.montantRestant ?? PRIX_PERMIS).toLocaleString("fr-DZ")} DA`

    }))

  ];



  const paymentMethods = [

    { value: "",        label: "Méthode de paiement" },

    { value: "especes", label: "Espèces"              },

    { value: "ccp",     label: "CCP"                  },

    { value: "carte",   label: "Carte"                },

  ];



  const handleCandidateChange = (e) => {

    const id = e.target.value;

    if (!id) { setSelectedCandidate(null); return; }

    const found = candidatesList.find(c => String(c.idCandidat) === id);

    setSelectedCandidate(found || null);

    setAmount("");

    setErrors({});

  };



  const validateForm = () => {

    const newErrors = {};

    if (!selectedCandidate)                    newErrors.candidate   = "Veuillez choisir un candidat";

    if (!paymentType)                          newErrors.paymentType = "La méthode est requise";

    if (!amount || parseFloat(amount) <= 0)    newErrors.amount      = "Montant invalide";

    if (parseFloat(amount) > currentRemaining) newErrors.amount      = `Maximum autorisé : ${currentRemaining} DA`;

    if (!date)                                 newErrors.date        = "La date est requise";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };



  const handleSubmit = () => {

    if (validateForm()) {

      onAddPayment({

        idCandidat:    selectedCandidate.idCandidat,

        montant:       parseFloat(amount),

        methode:       paymentType,

        dateVersement: date,

        remarque:      remark,

        typeVersement: "seance",

      });

    }

  };



  const s = {

    overlay:  { position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1000 },

    modal:    { background:"#fff",borderRadius:"20px",width:"90%",maxWidth:"550px",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)" },

    header:   { display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid #E5E7EB",background:"#F9FAFB",borderRadius:"20px 20px 0 0" },

    body:     { padding:"24px" },

    title:    { fontSize:"16px",fontWeight:"600",color:"#374151",marginBottom:"16px",marginTop:"24px" },

    badge:    { padding:"14px",background:"#EBF5FF",borderRadius:"12px",border:"1px solid #4E96E1",marginBottom:"15px" },

    closeBtn: { background:"none",border:"none",fontSize:"20px",cursor:"pointer" },

  };



  return (

    <div style={s.overlay} onClick={onClose}>

      <div style={s.modal} onClick={e => e.stopPropagation()}>



        <div style={s.header}>

          <h3 style={{ margin:0 }}>{candidate ? "Détails du paiement" : "Nouveau Versement"}</h3>

          <button style={s.closeBtn} onClick={onClose}>✕</button>

        </div>



        <div style={s.body}>



          {/* SELECT CANDIDAT */}

          {!candidate && (

            <div style={{ marginBottom:"4px" }}>

              <Select

                label="Candidat *"

                value={selectedCandidate ? String(selectedCandidate.idCandidat) : ""}

                onChange={handleCandidateChange}

                options={candidateOptions}

                error={errors.candidate}

              />

              <p style={{ fontSize:"11px",color: loading?"#4E96E1":"#94A3B8",marginTop:"4px" }}>

                {loading

                  ? "⏳ Chargement de la liste..."

                  : `${candidatesList.length} candidat(s) avec solde en attente`}

              </p>

            </div>

          )}



          {/* BADGE CANDIDAT */}

          {selectedCandidate && (

            <div style={s.badge}>

              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>

                <div>

                  <div style={{ fontWeight:"700",color:"#2b537e",fontSize:"15px" }}>

                    {selectedCandidate.prenom} {selectedCandidate.nom}

                  </div>

                  <div style={{ fontSize:"13px",color:"#475569",marginTop:"4px" }}>

                    Reste actuel :&nbsp;

                    <strong style={{ color:"#b91c1c" }}>

                      {currentRemaining.toLocaleString("fr-DZ")} DA

                    </strong>

                    &nbsp;/&nbsp;

                    <span style={{ color:"#64748b" }}>Total : {PRIX_PERMIS.toLocaleString("fr-DZ")} DA</span>

                  </div>

                </div>

                {amount && parseFloat(amount) > 0 && (

                  <div style={{ textAlign:"right" }}>

                    <div style={{ fontSize:"11px",color:"#64748b" }}>Après versement :</div>

                    <div style={{ fontWeight:"800",fontSize:"18px",color:liveRemaining<=0?"#166534":"#b91c1c" }}>

                      {liveRemaining.toLocaleString("fr-DZ")} DA

                    </div>

                    {liveRemaining <= 0 && (

                      <div style={{ fontSize:"11px",color:"#166534",fontWeight:"600" }}>✅ Dossier soldé !</div>

                    )}

                  </div>

                )}

              </div>

              <div style={{ marginTop:"12px" }}>

                <div style={{ height:"6px",background:"#CBD5E0",borderRadius:"4px",overflow:"hidden" }}>

                  <div style={{

                    height:"100%",width:`${pctPaye}%`,

                    background:pctPaye>=100?"#166534":"#4E96E1",

                    borderRadius:"4px",transition:"width 0.3s ease"

                  }} />

                </div>

                <div style={{ display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#94A3B8",marginTop:"4px" }}>

                  <span>Déjà payé : {(PRIX_PERMIS - currentRemaining).toLocaleString("fr-DZ")} DA</span>

                  <span>{pctPaye}%</span>

                </div>

              </div>

            </div>

          )}



          {/* FORMULAIRE */}

          <div style={s.title}>Informations du versement</div>



          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px" }}>

            <Select

              label="Méthode *"

              value={paymentType}

              onChange={e => setPaymentType(e.target.value)}

              options={paymentMethods}

              error={errors.paymentType}

            />

            <Input

              label="Montant (DA) *"

              type="number"

              value={amount}

              onChange={e => setAmount(e.target.value)}

              placeholder={selectedCandidate ? `Max : ${currentRemaining.toLocaleString("fr-DZ")} DA` : "0"}

              error={errors.amount}

            />

          </div>



          <Input

            label="Date du versement *"

            type="date"

            value={date}

            onChange={e => setDate(e.target.value)}

            error={errors.date}

          />

          <Input

            label="Remarque"

            type="text"

            value={remark}

            onChange={e => setRemark(e.target.value)}

            placeholder="Ex: Tranche 2, règlement partiel..."

            textarea

            rows={2}

          />



          <div style={{ display:"flex",gap:"12px",marginTop:"24px" }}>

            <Button variant="secondary" onClick={onClose} style={{ flex:1 }}>Annuler</Button>

            <Button

              variant="primary"

              onClick={handleSubmit}

              style={{ flex:2 }}

              disabled={!selectedCandidate || loading}

            >

              Enregistrer le paiement

            </Button>

          </div>



        </div>

      </div>

    </div>

  );

};



export default PaymentModal;