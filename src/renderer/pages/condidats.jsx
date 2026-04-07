import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import "../../styles/condidats.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { SquarePen, Trash, Search, Phone } from "lucide-react";
import AddCandidatModal from "../components/addCondidat";

// ── données initiales ────────────────────────────────────────────────────────
const initialCandidats = [
  { id: 1, nom: "Belarbi",    prenom: "Tinhinane", tel: "06 12 34 56 78", inscription: "2025-01-15", sessions: 18, moniteur: "Jean Dupont",    status: "active",  sexe: "femme", dob: "", photo: null },
  { id: 2, nom: "Azil",       prenom: "Melissa",   tel: "06 23 45 67 89", inscription: "2025-02-01", sessions: 12, moniteur: "Sophie Laurent", status: "active",  sexe: "femme", dob: "", photo: null },
  { id: 3, nom: "Bouariche",  prenom: "Nadine",    tel: "06 34 56 78 90", inscription: "2025-03-10", sessions: 25, moniteur: "Jean Dupont",    status: "pending", sexe: "femme", dob: "", photo: null },
  { id: 4, nom: "Benazzouz", prenom: "Sonia",     tel: "06 34 56 78 90", inscription: "2025-03-10", sessions: 22, moniteur: "Jean Dupont",    status: "pending", sexe: "femme", dob: "", photo: null },
  { id: 5, nom: "Albane",     prenom: "Amina",     tel: "06 34 56 78 90", inscription: "2025-03-10", sessions: 29, moniteur: "Jean Dupont",    status: "active",  sexe: "femme", dob: "", photo: null },
];

const Condidats = () => {
  const [candidats, setCandidats]     = useState(initialCandidats);
  const [showModal, setShowModal]     = useState(false);
  const [editCandidat, setEditCandidat] = useState(null); // null = ajout, objet = édition

  // ouvrir en mode édition
  const handleEdit = (candidat) => {
    setEditCandidat(candidat);
    setShowModal(true);
  };

  // ouvrir en mode ajout
  const handleAdd = () => {
    setEditCandidat(null);
    setShowModal(true);
  };

  // supprimer
  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce candidat ?"))
      setCandidats(prev => prev.filter(c => c.id !== id));
  };

  // sauvegarder (ajout ou édition)
  const handleSave = (data) => {
    if (data.id) {
      // édition
      setCandidats(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
    } else {
      // ajout
      setCandidats(prev => [...prev, { ...data, id: Date.now(), sessions: 0, moniteur: "", status: "pending" }]);
    }
    setShowModal(false);
  };

  return (
    <div className="container">
      <div className="main">
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1><img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école</h1>
          <p>Gérer les étudiants, les leçons et les examens</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Candidats</h2>
              <p>Gérer et suivre tous les candidats de l'auto-école</p>
            </div>
            <Button text="+ Ajouter candidat" onClick={handleAdd} showPlusIcon={false} />
          </div>

          <div className="search-bar">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search candidates..." className="search" />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Contact</th>
                <th>Date d'inscription</th>
                <th>Progress</th>
                <th>Moniteur</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidats.map(c => (
                <tr key={c.id}>
                  <td>{c.nom} {c.prenom}</td>
                  <td><Phone size={15} /> {c.tel}</td>
                  <td>{c.inscription}</td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${Math.min((c.sessions / 30) * 100, 100)}%` }} />
                    </div>
                    <span className="progress-text">{c.sessions}/30 sessions</span>
                  </td>
                  <td>{c.moniteur}</td>
                  <td><span className={`status ${c.status}`}>{c.status}</span></td>
                  <td className="actions">
                    <SquarePen size={17} color="blue" style={{ cursor: "pointer" }} onClick={() => handleEdit(c)} />
                    <Trash     size={17} color="red"  style={{ cursor: "pointer" }} onClick={() => handleDelete(c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCandidatModal
        showModal={showModal}
        setShowModal={setShowModal}
        candidat={editCandidat}   // ← pré-remplissage
        onSave={handleSave}        // ← callback save
      />
    </div>
  );
};

export default Condidats;