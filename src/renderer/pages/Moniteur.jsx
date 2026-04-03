import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../../styles/Moniteur.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";

/* ── INITIAL MOCK DATA ── */
const INITIAL_MONITEURS = [
  { id: 1, prenom: "Karim", nom: "Benali", email: "k.benali@autocole.dz", telephone: "+213 555 012 345", typeBoite: "manuelle", statut: "actif", nbEtudiants: 10 },
  { id: 2, prenom: "Samira", nom: "Aït Yahia", email: "s.aityahia@autocole.dz", telephone: "+213 555 023 456", typeBoite: "automatique", statut: "actif", nbEtudiants: 11  },
  { id: 3, prenom: "Yacine", nom: "Messaoud", email: "y.messaoud@autocole.dz", telephone: "+213 555 034 567", typeBoite: "manuelle", statut: "actif", nbEtudiants: 5  },
  { id: 4, prenom: "Nadia", nom: "Hadjadj", email: "n.hadjadj@autocole.dz", telephone: "+213 555 045 678", typeBoite: "automatique", statut: "inactif", nbEtudiants: 2 },
  { id: 5, prenom: "Bilal", nom: "Ouahrani", email: "b.ouahrani@autocole.dz", telephone: "+213 555 056 789", typeBoite: "manuelle", statut: "actif", nbEtudiants: 9  },
  { id: 6, prenom: "Assia", nom: "Tlemçani", email: "a.tlemcani@autocole.dz", telephone: "+213 555 067 890", typeBoite: "manuelle", statut: "inactif", nbEtudiants: 8  },
];

const EMPTY_FORM = { prenom: "", nom: "", email: "", telephone: "", typeBoite: "manuelle", statut: "actif",nbEtudiants: 0 };

/* ── MONITEUR CARD (version prototype) ── */
const MoniteurCard = ({ moniteur, onEdit, onDelete }) => {
  const initials = `${moniteur.prenom[0]}${moniteur.nom[0]}`.toUpperCase();

  return (
    <div className="moniteur-card">
      {/* Status badge */}
      <span className={`card-status ${moniteur.statut}`}>
        <i className="fa-solid fa-circle" />
        {moniteur.statut === "actif" ? "Actif" : "Inactif"}
      </span>

      <div className="card-body">
        {/* Avatar */}
        <div className="card-avatar">{initials}</div>

        {/* Name */}
        <p className="card-name">
          {moniteur.prenom} {moniteur.nom}
        </p>

        {/* Car type pill */}
        <span className={`card-car-type ${moniteur.typeBoite}`}>
          <i
            className={
              moniteur.typeBoite === "manuelle"
                ? "fa-solid fa-gears"
                : "fa-solid fa-gauge-high"
            }
          />
          {moniteur.typeBoite === "manuelle"
            ? "Boîte manuelle"
            : "Boîte automatique"}
        </span>

        {/* Info rows */}
        <div className="card-info-list">
          <div className="card-info-row">
            <i className="fa-solid fa-envelope" />
            <span title={moniteur.email}>{moniteur.email}</span>
          </div>
          <div className="card-info-row">
            <i className="fa-solid fa-phone" />
            <span>{moniteur.telephone}</span>
          </div>
        </div>

        <div className="card-meta">
          <i className="fa-solid fa-user"></i>
          <span className="meta-value">{moniteur.nbEtudiants}</span>
          <span className="meta-label">Candidats</span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="card-footer">
        <button className="btn-edit" onClick={() => onEdit(moniteur)}>
          <i className="fa-solid fa-pen-to-square" />
          Modifier
        </button>
        <button
          className="btn-delete"
          onClick={() => onDelete(moniteur)}
          title="Supprimer"
        >
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
};

/* ── MODAL AJOUT / MODIFICATION ── (inchangée) ── */
const MoniteurModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  React.useEffect(() => {
    if (editData) setForm({ ...editData });
    else setForm(EMPTY_FORM);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = e => { e.preventDefault(); onSave(form); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2><i className={editData ? "fa-solid fa-pen-to-square" : "fa-solid fa-user-plus"} /> {editData ? "Modifier le moniteur" : "Ajouter un moniteur"}</h2>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label><i className="fa-solid fa-id-card" /> Prénom <span>*</span> </label>
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="ex. Karim" required />
            </div>
            <div className="form-field">
              <label><i className="fa-solid fa-id-card" /> Nom <span>*</span> </label>
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="ex. Benali" required />
            </div>
          </div>
          <div className="form-field">
            <label><i className="fa-solid fa-envelope" /> Adresse e-mail <span>*</span> </label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ex. k.benali@autocole.dz" required />
          </div>
          <div className="form-field">
            <label><i className="fa-solid fa-phone" /> Téléphone <span>*</span> </label>
            <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="ex. +213 555 012 345" required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label><i className="fa-solid fa-car" /> Type de boîte</label>
              <select name="typeBoite" value={form.typeBoite} onChange={handleChange}>
                <option value="manuelle">Boîte manuelle</option>
                <option value="automatique">Boîte automatique</option>
              </select>
            </div>
            <div className="form-field">
              <label><i className="fa-solid fa-circle-check" /> Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save"><i className="fa-solid fa-floppy-disk" /> {editData ? "Enregistrer" : "Ajouter"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── MODAL CONFIRMATION SUPPRESSION ── (inchangée) ── */
const ConfirmDeleteModal = ({ isOpen, moniteur, onClose, onConfirm }) => {
  if (!isOpen || !moniteur) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box confirm">
        <div className="confirm-icon"><i className="fa-solid fa-trash" /></div>
        <p className="confirm-title">Supprimer le moniteur</p>
        <p className="confirm-text">
          Êtes-vous sûr de vouloir supprimer <strong>{moniteur.prenom} {moniteur.nom}</strong> ? Cette action est irréversible.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-delete-confirm" onClick={() => onConfirm(moniteur.id)}><i className="fa-solid fa-trash" /> Supprimer</button>
        </div>
      </div>
    </div>
  );
};

/* ── PAGE PRINCIPALE MONITEUR ── */
const Moniteur = () => {
  const [moniteurs, setMoniteurs] = useState(INITIAL_MONITEURS);

  // Search & filters
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterBoite, setFilterBoite] = useState("tous");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtrage
  const filtered = moniteurs.filter(m => {
    const matchSearch = `${m.prenom} ${m.nom} ${m.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || m.statut === filterStatut;
    const matchBoite = filterBoite === "tous" || m.typeBoite === filterBoite;
    return matchSearch && matchStatut && matchBoite;
  });

  const handleSave = form => {
    if (editTarget) {
      setMoniteurs(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...form } : m));
      setEditTarget(null);
    } else {
      const newId = Math.max(...moniteurs.map(m => m.id), 0) + 1;
      setMoniteurs(prev => [...prev, { ...form, id: newId }]);
    }
    setShowAddModal(false);
  };

  const handleDelete = id => {
    setMoniteurs(prev => prev.filter(m => m.id !== id));
    setDeleteTarget(null);
  };

  const openEdit = moniteur => { setEditTarget(moniteur); setShowAddModal(true); };
  const openAdd = () => { setEditTarget(null); setShowAddModal(true); };

  return (
     <div className="container">
 <div className="main">
           {/* Header identique à la page Candidats */}
           <div className="header">
                    <img src={ConnexionImg} alt="illustration" className="header-img" />
                    <h1>
                      <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
                    </h1>
                    <p>Gérer les étudiants, les leçons et les examens</p>
                  </div>

        <div className="moniteur-content">
          {/* Barre d'outils : recherche + filtres + bouton ajout */}
          <div className="moniteur-toolbar">
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Rechercher un moniteur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <button className={`filter-btn ${filterStatut === "tous" ? "active" : ""}`} onClick={() => setFilterStatut("tous")}>Tous</button>
              <button className={`filter-btn ${filterStatut === "actif" ? "active" : ""}`} onClick={() => setFilterStatut(filterStatut === "actif" ? "tous" : "actif")}>Actifs</button>
              <button className={`filter-btn ${filterStatut === "inactif" ? "active" : ""}`} onClick={() => setFilterStatut(filterStatut === "inactif" ? "tous" : "inactif")}>Inactifs</button>
              <button className={`filter-btn ${filterBoite === "manuelle" ? "active" : ""}`} onClick={() => setFilterBoite(filterBoite === "manuelle" ? "tous" : "manuelle")}>Manuelle</button>
              <button className={`filter-btn ${filterBoite === "automatique" ? "active" : ""}`} onClick={() => setFilterBoite(filterBoite === "automatique" ? "tous" : "automatique")}>Automatique</button>
            </div>

            <button className="btn-add-moniteur" onClick={openAdd}>
              <i className="fa-solid fa-plus" /> Ajouter un moniteur
            </button>
          </div>

          {/* Grille de cartes */}
          <div className="moniteur-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-user-slash" />
                <p>Aucun moniteur trouvé pour cette recherche.</p>
              </div>
            ) : (
              filtered.map(m => (
                <MoniteurCard
                  key={m.id}
                  moniteur={m}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <MoniteurModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditTarget(null); }}
        onSave={handleSave}
        editData={editTarget}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        moniteur={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Moniteur;