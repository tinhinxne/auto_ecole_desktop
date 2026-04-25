import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import "../../styles/condidats.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { SquarePen, Trash, Search, Phone } from "lucide-react";
import AddCandidatModal from "../components/addCondidat";

const Condidats = () => {
  const [candidats, setCandidats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCandidat, setEditCandidat] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // ← NOUVEAU
  const th = { padding: '15px 16px', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '14px' };
const td = { padding: '14px 16px', borderBottom: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937' };

  // ─────────────────────────────────────────────
  // 🔍 FILTRAGE DES CANDIDATS
  // ─────────────────────────────────────────────
  const candidatsFiltres = candidats.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.tel.toLowerCase().includes(q) ||
      (c.status && c.status.toLowerCase().includes(q))
    );
  });

  // ─────────────────────────────────────────────
  // 🔥 LOAD DATA FROM MYSQL
  // ─────────────────────────────────────────────
const loadCandidats = async () => {
  try {
    const data = await window.electron.getCandidats();

    // Récupérer les séances une seule fois
    const seances = await window.electron.getSeances();

    const formatted = data.map((c) => {
      // Compter les séances de ce candidat
      const nbSessions = seances.filter((s) => {
        if (!s.candidatsIds) return false;
        const ids = String(s.candidatsIds).split(",").map((id) => parseInt(id.trim()));
        return ids.includes(c.idCandidat);
      }).length;

      return {
        id: c.idCandidat,
        nom: c.nom,
        prenom: c.prenom,
        tel: c.telephone,
        inscription: c.date_inscription
          ? new Date(c.date_inscription).toISOString().split("T")[0]
          : "",
        dob: c.date_naissance
          ? new Date(c.date_naissance).toISOString().split("T")[0]
          : "",
        sessions: nbSessions,   // ← nombre réel de séances
        
        status: c.statut,
        sexe: c.sexe,
        photo: c.photo || null,
      };
    });

    setCandidats(formatted);
  } catch (error) {
    console.error("Erreur lors du chargement des candidats :", error);
    setCandidats([]);
  }
};

  useEffect(() => {
    loadCandidats();
  }, []);

  // ─────────────────────────────────────────────
  // ✏️ EDIT
  // ─────────────────────────────────────────────
  const handleEdit = (candidat) => {
    setEditCandidat(candidat);
    setShowModal(true);
  };

  // ➕ ADD
  const handleAdd = () => {
    setEditCandidat(null);
    setShowModal(true);
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce candidat ?")) {
      await window.electron.deleteCandidat(id);
      loadCandidats();
    }
  };

  // 💾 SAVE (ADD + UPDATE)
  const handleSave = async (data) => {
    if (data.idCandidat) {
      await window.electron.updateCandidat(data);
    } else {
      await window.electron.addCandidat(data);
    }
    await loadCandidats();
    setShowModal(false);
  };

  return (
    <div className="container">
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <img src={ConnexionImg} alt="" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} />
            Panneau de contrôle de l'auto-école
          </h1>
          <p>Gérer les étudiants, les leçons et les examens</p>
        </div>

        {/* CARD */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Candidats</h2>
              <p>Gérer et suivre tous les candidats</p>
            </div>
            <Button text="+ Ajouter candidat" onClick={handleAdd} />
          </div>

          {/* SEARCH */}
          <div className="search-bar">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                className="search"
                value={searchQuery}                          // ← NOUVEAU
                onChange={(e) => setSearchQuery(e.target.value)} // ← NOUVEAU
              />
            </div>
          </div>

          {/* TABLE */}
         {/* TABLE */}
<div style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <tr style={{ background: "#2b537e" }}>
          <th style={th}>Candidat</th>
          <th style={th}>Contact</th>
          <th style={th}>Date d'inscription</th>
          <th style={th}>Progress</th>
          <th style={th}>Status</th>
          <th style={th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {candidatsFiltres.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#A0AEC0" }}>
              Aucun candidat trouvé
            </td>
          </tr>
        ) : (
          candidatsFiltres.map((c, index) => (
            <tr key={c.id} style={{ background: index % 2 === 0 ? "#fff" : "#F8FAFC" }}>
              <td style={td}>{c.nom} {c.prenom}</td>
              <td style={td}><Phone size={15} /> {c.tel}</td>
              <td style={td}>{c.inscription}</td>
              <td style={td}>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${Math.min((c.sessions / 30) * 100, 100)}%` }} />
                </div>
                <span className="progress-text">{c.sessions}/30 sessions</span>
              </td>
              <td style={td}>
                <span className={`status ${c.status}`}>{c.status}</span>
              </td>
              <td style={td}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <SquarePen size={17} color="blue" style={{ cursor: "pointer" }} onClick={() => handleEdit(c)} />
                  <Trash size={17} color="red" style={{ cursor: "pointer" }} onClick={() => handleDelete(c.id)} />
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
        </div>
      </div>

      {/* MODAL */}
      <AddCandidatModal
        showModal={showModal}
        setShowModal={setShowModal}
        candidat={editCandidat}
        onSave={handleSave}
      />
    </div>
  );
};

export default Condidats;