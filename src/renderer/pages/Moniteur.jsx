import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import carBannerImg from "../../assets/car_banner.png";
import "./Moniteur.css";

/* ─────────────────────────────────────
   INITIAL MOCK DATA
───────────────────────────────────── */
const INITIAL_MONITEURS = [
  {
    id: 1,
    prenom: "Karim",
    nom: "Benali",
    email: "k.benali@autocole.dz",
    telephone: "+213 555 012 345",
    typeBoite: "manuelle",
    nbEtudiants: 14,
    rating: 4.5,
    statut: "actif",
    photo: null,
  },
  {
    id: 2,
    prenom: "Samira",
    nom: "Aït Yahia",
    email: "s.aityahia@autocole.dz",
    telephone: "+213 555 023 456",
    typeBoite: "automatique",
    nbEtudiants: 9,
    rating: 4.8,
    statut: "actif",
    photo: null,
  },
  {
    id: 3,
    prenom: "Yacine",
    nom: "Messaoud",
    email: "y.messaoud@autocole.dz",
    telephone: "+213 555 034 567",
    typeBoite: "manuelle",
    nbEtudiants: 11,
    rating: 3.5,
    statut: "actif",
    photo: null,
  },
  {
    id: 4,
    prenom: "Nadia",
    nom: "Hadjadj",
    email: "n.hadjadj@autocole.dz",
    telephone: "+213 555 045 678",
    typeBoite: "automatique",
    nbEtudiants: 7,
    rating: 4.0,
    statut: "inactif",
    photo: null,
  },
  {
    id: 5,
    prenom: "Bilal",
    nom: "Ouahrani",
    email: "b.ouahrani@autocole.dz",
    telephone: "+213 555 056 789",
    typeBoite: "manuelle",
    nbEtudiants: 18,
    rating: 5.0,
    statut: "actif",
    photo: null,
  },
  {
    id: 6,
    prenom: "Assia",
    nom: "Tlemçani",
    email: "a.tlemcani@autocole.dz",
    telephone: "+213 555 067 890",
    typeBoite: "manuelle",
    nbEtudiants: 5,
    rating: 3.0,
    statut: "inactif",
    photo: null,
  },
];

const EMPTY_FORM = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  typeBoite: "manuelle",
  statut: "actif",
};

/* ─────────────────────────────────────
   MONITEUR CARD
───────────────────────────────────── */
const MoniteurCard = ({ moniteur, onEdit, onDelete }) => {
  const {
    prenom,
    nom,
    email,
    telephone,
    typeBoite,
    nbEtudiants,
    rating,
    statut,
  } = moniteur;

  return (
    <div className="moniteur-card">
      {/* Status badge */}
      <span className={`card-status ${statut}`}>
        <i className="fa-solid fa-circle" />
        {statut === "actif" ? "Actif" : "Inactif"}
      </span>

      <div className="card-body">
        {/* Avatar */}
        <div className="card-avatar">
          <i className="fa-solid fa-user" />
        </div>

        {/* Name */}
        <p className="card-name">
          {prenom} {nom}
        </p>

        {/* Car type pill */}
        <span className={`card-car-type ${typeBoite}`}>
          <i
            className={
              typeBoite === "manuelle"
                ? "fa-solid fa-gears"
                : "fa-solid fa-gauge-high"
            }
          />
          {typeBoite === "manuelle" ? "Boîte manuelle" : "Boîte automatique"}
        </span>

        {/* Info rows */}
        <div className="card-info-list">
          <div className="card-info-row">
            <i className="fa-solid fa-envelope" />
            <span title={email}>{email}</span>
          </div>
          <div className="card-info-row">
            <i className="fa-solid fa-phone" />
            <span>{telephone}</span>
          </div>
        </div>

        <div className="card-meta">
          <i className="fa-solid fa-user"></i>
          <span className="meta-value">{nbEtudiants}</span>
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

/* ─────────────────────────────────────
   ADD / EDIT MODAL
───────────────────────────────────── */
const MoniteurModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editData) {
      setForm({
        prenom: editData.prenom,
        nom: editData.nom,
        email: editData.email,
        telephone: editData.telephone,
        typeBoite: editData.typeBoite,
        statut: editData.statut,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2>
            <i
              className={
                editData ? "fa-solid fa-pen-to-square" : "fa-solid fa-user-plus"
              }
            />
            {editData ? "Modifier le moniteur" : "Ajouter un moniteur"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>
                <i className="fa-solid fa-id-card" />
                Prénom
              </label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                placeholder="ex. Karim"
                required
              />
            </div>
            <div className="form-field">
              <label>
                <i className="fa-solid fa-id-card" />
                Nom
              </label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="ex. Benali"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>
              <i className="fa-solid fa-envelope" />
              Adresse e-mail
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ex. k.benali@autocole.dz"
              required
            />
          </div>

          <div className="form-field">
            <label>
              <i className="fa-solid fa-phone" />
              Téléphone
            </label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="ex. +213 555 012 345"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <i className="fa-solid fa-car" />
                Type de boîte
              </label>
              <select
                name="typeBoite"
                value={form.typeBoite}
                onChange={handleChange}
              >
                <option value="manuelle">Boîte manuelle</option>
                <option value="automatique">Boîte automatique</option>
              </select>
            </div>
            <div className="form-field">
              <label>
                <i className="fa-solid fa-circle-check" />
                Statut
              </label>
              <select name="statut" value={form.statut} onChange={handleChange}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-save">
              <i className="fa-solid fa-floppy-disk" />
              {editData ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   CONFIRM DELETE MODAL
───────────────────────────────────── */
const ConfirmDeleteModal = ({ isOpen, moniteur, onClose, onConfirm }) => {
  if (!isOpen || !moniteur) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box confirm">
        <div className="confirm-icon">
          <i className="fa-solid fa-trash" />
        </div>
        <p className="confirm-title">Supprimer le moniteur</p>
        <p className="confirm-text">
          Êtes-vous sûr de vouloir supprimer{" "}
          <strong>
            {moniteur.prenom} {moniteur.nom}
          </strong>{" "}
          ?<br />
          Cette action est irréversible.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn-delete-confirm"
            onClick={() => onConfirm(moniteur.id)}
          >
            <i className="fa-solid fa-trash" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────── */
const Moniteur = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [moniteurs, setMoniteurs] = useState(INITIAL_MONITEURS);

  // Search & filters
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous"); // tous | actif | inactif
  const [filterBoite, setFilterBoite] = useState("tous"); // tous | manuelle | automatique

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("userRole");
    if (!storedRole) {
      navigate("/access");
      return;
    }
    setRole(storedRole);
  }, [navigate]);

  /* ── Derived stats ── */
  const totalActifs = moniteurs.filter((m) => m.statut === "actif").length;
  const totalInactifs = moniteurs.filter((m) => m.statut === "inactif").length;
  const totalEtudiants = moniteurs.reduce((acc, m) => acc + m.nbEtudiants, 0);

  /* ── Filtered list ── */
  const filtered = moniteurs.filter((m) => {
    const matchSearch = `${m.prenom} ${m.nom} ${m.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || m.statut === filterStatut;
    const matchBoite = filterBoite === "tous" || m.typeBoite === filterBoite;
    return matchSearch && matchStatut && matchBoite;
  });

  /* ── Handlers ── */
  const handleSave = (form) => {
    if (editTarget) {
      setMoniteurs((prev) =>
        prev.map((m) => (m.id === editTarget.id ? { ...m, ...form } : m)),
      );
      setEditTarget(null);
    } else {
      const newId = Math.max(...moniteurs.map((m) => m.id), 0) + 1;
      setMoniteurs((prev) => [
        ...prev,
        { ...form, id: newId, nbEtudiants: 0, rating: 0, photo: null },
      ]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setMoniteurs((prev) => prev.filter((m) => m.id !== id));
    setDeleteTarget(null);
  };

  const openEdit = (moniteur) => {
    setEditTarget(moniteur);
    setShowAddModal(true);
  };

  const openAdd = () => {
    setEditTarget(null);
    setShowAddModal(true);
  };

  if (!role) return null;

  return (
    <div className="moniteur-layout">
      <Sidebar role={role} />

      <div className="moniteur-main">
        {/* ── Top Bar ── */}
        <div className="moniteur-topbar">
          <img src={carBannerImg} className="topbar-bg-img" />
          <div className="topbar-left">
            <h1>
              <i className="fa-solid fa-chalkboard-user" />
              Gestion des Moniteurs
            </h1>
            <p>Consulter, ajouter et gérer les moniteurs de l'auto-école</p>
          </div>
          <div className="topbar-right">
            <span className="topbar-role-badge">Administrateur</span>
            <div className="topbar-avatar">A</div>
          </div>
        </div>

        <div className="moniteur-content">
          {/* ── Stats strip ── */}
          <div className="moniteur-stats-strip">
            <div className="strip-stat">
              <div className="strip-stat-icon blue">
                <i className="fa-solid fa-users" />
              </div>
              <div className="strip-stat-info">
                <p>Total moniteurs</p>
                <strong>{moniteurs.length}</strong>
                <span className="strip-trend up">
                  <i className="fa-solid fa-arrow-trend-up" /> +1 moniteur ce
                  mois
                </span>
              </div>
            </div>

            <div className="strip-stat">
              <div className="strip-stat-icon green">
                <i className="fa-solid fa-circle-check" />
              </div>
              <div className="strip-stat-info">
                <p>Actifs</p>
                <strong>{totalActifs}</strong>
                <span className="strip-trend up">
                  <i className="fa-solid fa-arrow-trend-up" /> +2 actifs ce mois
                </span>
              </div>
            </div>

            <div className="strip-stat">
              <div className="strip-stat-icon orange">
                <i className="fa-solid fa-graduation-cap" />
              </div>
              <div className="strip-stat-info">
                <p>Candidats encadrés</p>
                <strong>{totalEtudiants}</strong>
                <span className="strip-trend down">
                  <i className="fa-solid fa-arrow-trend-down" /> -1 candidat ce
                  mois
                </span>
              </div>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="moniteur-toolbar">
            {/* Search */}
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                className="search-input"
                type="text"
                placeholder="Rechercher un moniteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="filter-group">
              <button
                className={`filter-btn ${filterStatut === "tous" ? "active" : ""}`}
                onClick={() => setFilterStatut("tous")}
              >
                <i className="fa-solid fa-layer-group" />
                Tous
              </button>
              <button
                className={`filter-btn ${filterStatut === "actif" ? "active-moniteur" : ""}`}
                onClick={() =>
                  setFilterStatut(filterStatut === "actif" ? "tous" : "actif")
                }
              >
                <i className="fa-solid fa-circle-check" />
                Actifs
              </button>
              <button
                className={`filter-btn ${filterStatut === "inactif" ? "active" : ""}`}
                onClick={() =>
                  setFilterStatut(
                    filterStatut === "inactif" ? "tous" : "inactif",
                  )
                }
              >
                <i className="fa-solid fa-circle-xmark" />
                Inactifs
              </button>
              <button
                className={`filter-btn ${filterBoite === "manuelle" ? "active" : ""}`}
                onClick={() =>
                  setFilterBoite(
                    filterBoite === "manuelle" ? "tous" : "manuelle",
                  )
                }
              >
                <i className="fa-solid fa-gears" />
                Manuelle
              </button>
              <button
                className={`filter-btn ${filterBoite === "automatique" ? "active" : ""}`}
                onClick={() =>
                  setFilterBoite(
                    filterBoite === "automatique" ? "tous" : "automatique",
                  )
                }
              >
                <i className="fa-solid fa-gauge-high" />
                Automatique
              </button>
            </div>

            {/* Add button */}
            <button className="btn-add-moniteur" onClick={openAdd}>
              <i className="fa-solid fa-plus" />
              Ajouter un moniteur
            </button>
          </div>

          {/* ── Cards grid ── */}
          <div className="moniteur-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-user-slash" />
                <p>Aucun moniteur trouvé pour cette recherche.</p>
              </div>
            ) : (
              filtered.map((m) => (
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

      {/* ── Add / Edit Modal ── */}
      <MoniteurModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        editData={editTarget}
      />

      {/* ── Confirm Delete Modal ── */}
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
