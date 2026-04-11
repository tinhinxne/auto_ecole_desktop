import React, { useState, useEffect } from "react";
import "../../styles/Moniteur.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import Button from "../components/Button";
import AddMoniteurModal from "../components/addMoniteur";

const MoniteurCard = ({ moniteur, onDelete, onEdit }) => {
  // Sécurité pour les initiales si le nom/prénom est manquant
  const initials = `${moniteur.prenom?.[0] || ""}${moniteur.nom?.[0] || ""}`.toUpperCase();

  return (
    <div className="moniteur-card-proto">
      <div className="card-header-proto">
        <div className="avatar-proto">{initials}</div>
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

  // 1. CHARGER LES DONNÉES DEPUIS MYSQL
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

  // 2. AJOUTER OU MODIFIER
  const handleSave = async (data) => {
    try {
      let result;
      if (data.id) {
        // Mode Edition
        result = await window.electron.updateMoniteur(data);
      } else {
        // Mode Ajout
        result = await window.electron.addMoniteur(data);
      }

      if (result.success) {
        await loadMoniteurs(); // Recharger la liste depuis la BDD
        setShowModal(false);
      } else {
        alert("Erreur: " + (result.error || "Opération échouée"));
      }
    } catch (err) {
      console.error("Erreur save:", err);
    }
  };

  // 3. SUPPRIMER
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce moniteur définitivement ?")) {
      try {
        const result = await window.electron.deleteMoniteur(id);
        if (result.success) {
          loadMoniteurs();
        }
      } catch (err) {
        console.error("Erreur delete:", err);
      }
    }
  };

  const handleEditClick = (moniteur) => {
    setSelectedMoniteur(moniteur);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedMoniteur(null);
    setShowModal(true);
  };

  // FILTRAGE
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

          <div className="toolbar-container">
            <div className="search-bar-proto">
              <i className="fa-solid fa-magnifying-glass" />
              <input 
                type="text" 
                placeholder="Rechercher un nom..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="filter-buttons">
              <button className={filterStatus === "tous" ? "active" : ""} onClick={() => setFilterStatus("tous")}>Tous</button>
              <button className={filterStatus === "actif" ? "active" : ""} onClick={() => setFilterStatus("actif")}>Actifs</button>
              <button className={filterStatus === "inactif" ? "active" : ""} onClick={() => setFilterStatus("inactif")}>Inactifs</button>
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