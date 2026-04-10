import React, { useState, useEffect } from "react";
import PaymentModal from "../components/PaymentModal";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import "../../styles/payment.css";


/**
 * Transforme une ligne retournée par get-payments (JOIN Versement+Paiement+Candidat)
 * en objet compatible avec le tableau et le modal.
 */
function rowToPayment(row) {
  const montantPaye = (row.montantTotal || 0) - (row.montantRestant || 0);

  let formattedDate = '';
  if (row.dateVersement) {
    const d = new Date(row.dateVersement);
    // This ensures we get 2026-03-08 regardless of the input type
    formattedDate = d.toISOString().split('T')[0];
  }

  return {
    idVersement: row.idVersement,
    idPaiement:  row.idPaiement,
    idCandidat:  row.idCandidat,
    name:   (row.name || '').trim(), // .trim() is crucial here
    date:   formattedDate,
    amount: `${Number(row.montant).toLocaleString('fr-DZ')} DA`,
    type:   row.typePaiement === 'complet' ? 'Complet' : 'Par tranche',
    method: methodeLabel(row.methode),
    total:  row.montantTotal,
    paid:   montantPaye,
    statutPaiement: row.statutPaiement,
    history: [],
  };
}

function methodeLabel(methode) {
  const map = { ccp: 'CCP', carte: 'Carte', especes: 'Espèces' };
  return map[methode] ?? methode;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const Payments = () => {
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate]   = useState('2024-01-01');
  const [endDate, setEndDate]       = useState('2027-12-31');

  // ── Chargement initial ───────────────────────────────────────
  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    try {
      const rows = await window.electron.getPayments();
      console.log(rows);
      setPayments(rows.map(rowToPayment));
    } catch (err) {
      console.error('Erreur chargement paiements :', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Ouverture du modal : on charge l'historique complet ──────
async function openModal(item) {
  try {
    const rawHistory = await window.electron.getPaymentHistory(item.idCandidat);
    
    // Format history rows to match the Modal's table expectations
    const formattedHistory = rawHistory.map(h => ({
      id: h.idVersement,
      date: h.dateVersement?.toString().slice(0, 10) ?? '',
      method: methodeLabel(h.methode),
      amount: `${Number(h.montant).toLocaleString('fr-DZ')} DA`,
      remark: h.remarque ?? '-'
    }));

    setSelected({ ...item, history: formattedHistory });
  } catch (err) {
    console.error("History load error:", err);
    setSelected(item);
  }
  setShowModal(true);
}

  // ── Ajout d'un versement depuis le modal ─────────────────────
  // TODO: add paymment:
  async function handleAddPayment(newPayment) {
    return result;
  }

  // ── Téléchargement de facture (placeholder) ──────────────────
  function handleDownload(item) {
    alert(`Téléchargement de la facture pour ${item.name}`);
  }

  // ── Filtrage ─────────────────────────────────────────────────
const filtered = payments.filter((p) => {
  const name = (p.name || '').toLowerCase();
  const matchName = name.includes(searchTerm.toLowerCase());

  const date = p.date; 
  const matchDate = date >= startDate && date <= endDate;

  return matchName && matchDate;
});


  // ── Styles inline réutilisables ───────────────────────────────
  const th = { padding: '15px 16px', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '14px' };
  const td = { padding: '14px 16px', borderBottom: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937' };

  // ── Stats dérivées du state (remplace les valeurs codées en dur) ─
  const totalRevenu    = payments.reduce((acc, p) => acc + (p.paid || 0), 0);
  const totalPrevision = payments.reduce((acc, p) => acc + ((p.total || 0) - (p.paid || 0)), 0);
  const tauxRecouvrement = payments.length
    ? Math.round((payments.filter((p) => p.statutPaiement === 'solde').length / payments.length) * 100)
    : 0;

  // ─────────────────────────────────────────────────────────────
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

        {/* CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '30px', marginTop: '20px' }}>
          {[
            { title: "Chiffre d'Affaires",    value: `${totalRevenu.toLocaleString('fr-DZ')} DA`,    detail: 'Encaissé total',          color: '#2b537e' },
            { title: "Prévisions d'Entrée",    value: `${totalPrevision.toLocaleString('fr-DZ')} DA`, detail: 'Tranches à venir',        color: '#011659' },
            { title: 'Taux de Recouvrement',   value: `${tauxRecouvrement} %`,                        detail: 'Dossiers soldés / total', color: '#166534' },
          ].map((card, i) => (
            <div
              key={i}
              style={{ background: '#DDE2EF', borderRadius: '16px', padding: '24px', borderLeft: `6px solid ${card.color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', cursor: 'default' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.title}</p>
              <h2 style={{ margin: '8px 0', fontSize: '26px', fontWeight: '800', color: '#1e293b' }}>{card.value}</h2>
              <p style={{ margin: 0, fontSize: '13px', color: card.color, fontWeight: '600' }}>{card.detail}</p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '15px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', border: '1px solid #011659' }}>
          <input
            type="text"
            placeholder="Rechercher un candidat…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #2b537e', borderRadius: '10px', outline: 'none' }}
          />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '10px', border: '1px solid #4E96E1', borderRadius: '10px' }} />
          <span>à</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px', border: '1px solid #4E96E1', borderRadius: '10px' }} />
        </div>

        {/* TABLE */}
        <div style={{ background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Chargement…</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#2b537e' }}>
                    <th style={th}>Candidat</th>
                    <th style={th}>Date versement</th>
                    <th style={th}>Montant versé</th>
                    <th style={th}>Statut</th>
                    <th style={th}>Méthode</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                        Aucun paiement trouvé
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, index) => (
                      <tr
                        key={item.idVersement}
                        style={{ background: index % 2 === 0 ? '#fff' : '#F0F4F9', cursor: 'pointer' }}
                        onClick={() => openModal(item)}
                      >
                        <td style={td}>{item.name}</td>
                        <td style={td}>{item.date}</td>
                        <td style={td}>{item.amount}</td>
                        <td style={td}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                            background: item.type === 'Complet' ? '#DCFCE7' : '#FEF3C7',
                            color:      item.type === 'Complet' ? '#166534' : '#9B2C1D',
                          }}>
                            {item.type}
                          </span>
                        </td>
                        <td style={td}>{item.method}</td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openModal(item); }}
                              style={{ background: '#2b537e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Gérer
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                              style={{ padding: '6px 14px', background: '#011659', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Facture
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
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