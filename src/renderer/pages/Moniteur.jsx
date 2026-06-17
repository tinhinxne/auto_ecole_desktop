import React, { useState, useEffect } from "react";
import "../../styles/Moniteur.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import Button from "../components/Button";
import AddMoniteurModal from "../components/addMoniteur";

// Couleurs par famille de permis
const CATEGORY_COLORS = {
  A1: { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
  A:  { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
  B:  { bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD" },
  BE: { bg: "#EDE9FE", color: "#5B21B6", border: "#C4B5FD" },
  C1: { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  C:  { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  C1E:{ bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
  CE: { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
  D:  { bg: "#FCE7F3", color: "#9D174D", border: "#F9A8D4" },
  DE: { bg: "#FDF2F8", color: "#831843", border: "#F0ABFC" },
  F:  { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" },
};

const CategoryBadge = ({ cat }) => {
  const colors = CATEGORY_COLORS[cat] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 9px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.4px",
      background: colors.bg,
      color: colors.color,
      border: `1.5px solid ${colors.border}`,
      fontFamily: "'Sora', sans-serif",
    }}>
      {cat}
    </span>
  );
};

const MoniteurCard = ({ moniteur, onDelete, onEdit }) => {
  const initials = `${moniteur.prenom?.[0] || ""}${moniteur.nom?.[0] || ""}`.toUpperCase();

  // Convertir la chaîne "B,C,D" en tableau ["B","C","D"]
  const categories = moniteur.categories_habilitees
    ? moniteur.categories_habilitees.split(",").map(c => c.trim()).filter(Boolean)
    : ["B"];

  return (
    <div className="moniteur-card-proto">
      <div className="card-header-proto">
        <div className="avatar-proto">
          {moniteur.photo ? (
            <img
              src={moniteur.photo}
              alt={`${moniteur.prenom} ${moniteur.nom}`}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            initials
          )}
        </div>
        <span className={`status-pill-proto ${moniteur.statut}`}>
          {moniteur.statut === "actif" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="card-body-proto">
        <h3 className="name-proto">{moniteur.prenom} {moniteur.nom}</h3>
        <div className="info-list-proto">
          <div className="info-item-proto">
            <i className="fa-regular fa-envelope" />
            <span>{moniteur.email}</span>
          </div>
          <div className="info-item-proto">
            <i className="fa-solid fa-phone" />
            <span>{moniteur.telephone}</span>
          </div>
        </div>

        {/* ── Catégories de permis ── */}
        <div style={{ marginTop: "12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "6px",
          }}>
            <i className="fa-solid fa-id-card" style={{ fontSize: "11px", color: "#94A3B8" }} />
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Habilitations
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {categories.map(cat => (
              <CategoryBadge key={cat} cat={cat} />
            ))}
          </div>
        </div>
      </div>

      <div className="card-actions-proto">
        <button className="btn-edit-proto" onClick={() => onEdit(moniteur)}>
          <i className="fa-regular fa-pen-to-square" /> Modifier
        </button>
        <button className="btn-delete-proto" onClick={() => onDelete(moniteur.id)}>
          <i className="fa-solid fa-trash-can" />
        </button>
      </div>
    </div>
  );
};

const Moniteur = () => {
  const [moniteurs, setMoniteurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [showModal, setShowModal] = useState(false);
  const [selectedMoniteur, setSelectedMoniteur] = useState(null);

  const loadMoniteurs = async () => {
    try {
      const data = await window.electron.getMoniteurs();
      setMoniteurs(data);
    } catch (error) {
      console.error("Erreur lors du chargement des moniteurs:", error);
    }
  };

  useEffect(() => {
    loadMoniteurs();
  }, []);

  const handleSave = async (data) => {
    try {
      let result;
      if (data.id) {
        result = await window.electron.updateMoniteur(data);
      } else {
        result = await window.electron.addMoniteur(data);
      }

      if (result?.success) {
        await loadMoniteurs();
        if (data.id) setShowModal(false);
      }

      return result;
    } catch (err) {
      console.error("Erreur save:", err);
      return { success: false, error: err.message };
    }
  };

  const handleDelete = async (id) => {
    if (!id) { alert("Erreur : ID introuvable"); return; }
    if (window.confirm("Supprimer ce moniteur définitivement ?")) {
      try {
        const result = await window.electron.deleteMoniteur(id);
        if (result.success) await loadMoniteurs();
        else alert("Erreur BDD : " + result.error);
      } catch (err) {
        console.error("Erreur appel IPC delete:", err);
      }
    }
  };

  const handleEditClick  = (moniteur) => { setSelectedMoniteur(moniteur); setShowModal(true); };
  const handleAddClick   = ()          => { setSelectedMoniteur(null);     setShowModal(true); };

  const filteredMoniteurs = moniteurs.filter((m) => {
    const fullName = `${m.prenom} ${m.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "tous" || m.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container">
      <div className="main">
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1><img src={SmallCar} alt="" width={40} /> Panneau de contrôle</h1>
          <p>Gérer les moniteurs de l'auto-école</p>
        </div>

        <div className="content-section">
          <div className="section-header">
            <div>
              <h2>Moniteurs</h2>
              <p>{moniteurs.length} formateur(s) enregistré(s)</p>
            </div>
            <Button text="  + Ajouter moniteur" onClick={handleAddClick} />
          </div>

          <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "center" }}>
            <div style={{
              flex: 1, background: "#fff", padding: "12px 20px",
              borderRadius: "15px", display: "flex", gap: "15px",
              alignItems: "center", border: "1px solid #E2E8F0"
            }}>
              <input
                type="text"
                placeholder="🔍 Rechercher un moniteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1, padding: "10px", border: "1px solid #CBD5E0",
                  borderRadius: "10px", outline: "none", fontSize: "14px"
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4A5568" }}>
                <span>Statut :</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: "8px 12px", border: "1px solid #CBD5E0",
                    borderRadius: "8px", outline: "none", fontSize: "14px",
                    color: "#4A5568", background: "#fff", cursor: "pointer"
                  }}
                >
                  <option value="tous">Tous</option>
                  <option value="actif">Actifs</option>
                  <option value="inactif">Inactifs</option>
                </select>
              </div>
            </div>
          </div>

          <div className="moniteur-grid-proto">
            {filteredMoniteurs.length > 0 ? (
              filteredMoniteurs.map(m => (
                <MoniteurCard
                  key={m.id}
                  moniteur={m}
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                />
              ))
            ) : (
              <p className="no-data">Aucun moniteur trouvé.</p>
            )}
          </div>
        </div>
      </div>

      <AddMoniteurModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedMoniteur={selectedMoniteur}
        onSave={handleSave}
      />
    </div>
  );
};

export default Moniteur;