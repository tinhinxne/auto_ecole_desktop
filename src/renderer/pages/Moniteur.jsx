import React, { useState, useEffect } from "react";
import { UserRound, Camera } from "lucide-react";
import "../../styles/Moniteur.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";

const INITIAL_MONITEURS = [
  { id: 1, prenom: "Jean", nom: "Dupont", email: "jean.dupont@autoecole.com", telephone: "06 11 22 33 44", statut: "actif", nbEtudiants: 15, rating: 4.8 },
  { id: 2, prenom: "Sophie", nom: "Laurent", email: "sophie.laurent@autoecole.com", telephone: "06 22 33 44 55", statut: "actif", nbEtudiants: 12, rating: 4.9 },
  { id: 3, prenom: "Marc", nom: "Petit", email: "marc.petit@autoecole.com", telephone: "06 33 44 55 66", statut: "actif", nbEtudiants: 18, rating: 4.7 },
  { id: 4, prenom: "Claire", nom: "Moreau", email: "claire.moreau@autoecole.com", telephone: "06 44 55 66 77", statut: "inactif", nbEtudiants: 8, rating: 4.6 },
];

const MoniteurCard = ({ moniteur, onDelete, onEdit }) => {
  const initials = `${moniteur.prenom[0]}${moniteur.nom[0]}`.toUpperCase();

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

      <div className="card-stats-proto">
        <div className="stat-left">
          <i className="fa-solid fa-users" />
          <span>{moniteur.nbEtudiants} etudiants</span>
        </div>
      </div>

      <div className="card-actions-proto">
        <button className="btn-edit-proto" onClick={() => onEdit(moniteur)}>
          <i className="fa-regular fa-pen-to-square" /> Edit
        </button>
        <button className="btn-delete-proto" onClick={() => onDelete(moniteur.id)}>
          <i className="fa-solid fa-trash-can" />
        </button>
      </div>
    </div>
  );
};

const Moniteur = () => {
  const [moniteurs, setMoniteurs] = useState(INITIAL_MONITEURS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  
  // États pour la modale
  const [showModal, setShowModal] = useState(false);
  const [selectedMoniteur, setSelectedMoniteur] = useState(null);

  // Ouvrir la modale pour l'ajout
  const handleAddClick = () => {
    setSelectedMoniteur(null);
    setShowModal(true);
  };

  // Ouvrir la modale pour l'édition
  const handleEditClick = (moniteur) => {
    setSelectedMoniteur(moniteur);
    setShowModal(true);
  };

  const filteredMoniteurs = moniteurs.filter((m) => {
    const matchesSearch = `${m.prenom} ${m.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
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
              <p>Gérer et suivre tous les moniteurs</p>
            </div>
            <button className="btn-add-main-proto" onClick={handleAddClick}>
                + Ajouter moniteur
            </button>
          </div>

          {/* ... Toolbar (recherche & filtres) reste inchangée ... */}
          <div className="toolbar-container">
            <div className="search-bar-proto">
              <i className="fa-solid fa-magnifying-glass" />
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-buttons">
              <button className={filterStatus === "tous" ? "active" : ""} onClick={() => setFilterStatus("tous")}>Tous</button>
              <button className={filterStatus === "actif" ? "active" : ""} onClick={() => setFilterStatus("actif")}>Actifs</button>
              <button className={filterStatus === "inactif" ? "active" : ""} onClick={() => setFilterStatus("inactif")}>Inactifs</button>
            </div>
          </div>

          <div className="moniteur-grid-proto">
            {filteredMoniteurs.map(m => (
              <MoniteurCard 
                key={m.id} 
                moniteur={m} 
                onDelete={(id) => setMoniteurs(prev => prev.filter(x => x.id !== id))} 
                onEdit={handleEditClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MODALE UNIQUE (AJOUT & EDIT) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedMoniteur ? "Modifier le moniteur" : "Ajouter un moniteur"}</h2>
              <span className="close" onClick={() => setShowModal(false)}>✕</span>
            </div>
            <hr />
            <div className="modal-body">
              <div className="form-left">
                <label>Nom <span>*</span></label>
                <input type="text" defaultValue={selectedMoniteur?.nom || ""} placeholder="Saisir le nom" />
                
                <label>Prénom <span>*</span></label>
                <input type="text" defaultValue={selectedMoniteur?.prenom || ""} placeholder="Saisir le prénom" />
                
                <label>Email <span>*</span></label>
                <input type="email" defaultValue={selectedMoniteur?.email || ""} placeholder="exemple@autoecole.com" />

                <label>Téléphone <span>*</span></label>
                <input type="text" defaultValue={selectedMoniteur?.telephone || ""} placeholder="06 XX XX XX XX" />
                
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <label>Statut <span>*</span></label>
                    <select 
                      defaultValue={selectedMoniteur?.statut || "actif"}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, marginLeft: '15px' }}>
                    <label>Sexe <span>*</span></label>
                    <div className="gender" style={{ marginTop: '10px' }}>
                      <input type="radio" name="sexe" id="homme" defaultChecked={true} />
                      <label htmlFor="homme" style={{ marginRight: '10px' }}>H</label>
                      <input type="radio" name="sexe" id="femme" />
                      <label htmlFor="femme">F</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-right">
                <div className="avatar">
                  <UserRound size={40} className="avatar-icon" color="#1E2940" />
                  <div className="avatar-upload"><Camera size={14} color="#fff" /></div>
                </div>
                <button className="upload-btn">Photo du moniteur</button>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn primary">
                {selectedMoniteur ? "Mettre à jour" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moniteur;