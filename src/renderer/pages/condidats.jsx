import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import AddButton from "../components/Button";
import "../../styles/condidats.css";
import ConnexionImg from "../../assets/Connexion.png";
import {SquarePen,Trash} from "lucide-react";


const Condidats = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container">
      <Sidebar />

      <div className="main">
        {/* HEADER */}
        <div className="header">
            <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>Panneau de contrôle de l'auto-école</h1>
          <p>Gérer les étudiants, les leçons et les examens</p>
                  
        </div>

          

        {/* SECTION CANDIDATS */}
        <div className="card">
          <div className="card-header">
            <div>
               <h2>Candidats</h2>
               <p>Gérer et suivre tous les candidats de l'auto-école</p>

            </div>
           
           
<AddButton text="Ajouter candidat" onClick={() => setShowModal(true)} />

          </div>

         <div className="search-bar">
  <input
    type="text"
    placeholder="Search candidates..."
    className="search"
  />
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
              <tr>
                <td>Belarbi Tinhinane</td>
                <td>06 12 34 56 78</td>
                <td>2025-01-15</td>
              <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">120 sessions</span>
</td>

                <td>Jean Dupont</td>
                <td><span className="status active">Active</span></td>
                <td><SquarePen /><Trash /></td>
              </tr>

              <tr>
                <td>Azil Melissa</td>
                <td>06 23 45 67 89</td>
                <td>2025-02-01</td>
               <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">120 sessions</span>
</td>

                <td>Sophie Laurent</td>
                <td><span className="status active">Active</span></td>
                <td><SquarePen /><Trash /></td>
              </tr>

              <tr>
                <td>Bouariche Nadine</td>
                <td>06 34 56 78 90</td>
                <td>2025-03-10</td>
               <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">120 sessions</span>
</td>

                <td>Jean Dupont</td>
                <td><span className="status pending">Pending</span></td>
                <td><SquarePen /><Trash /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
{showModal && (
  <div className="modal-overlay">
    <div className="modal">
      
      {/* HEADER */}
      <div className="modal-header">
        <h2>Ajouter un candidat</h2>
        <span className="close" onClick={() => setShowModal(false)}>✕</span>
      </div>

      <hr />

      <div className="modal-body">

        {/* LEFT FORM */}
        <div className="form-left">

          <label>Nom du candidat *</label>
          <input type="text" placeholder="Saisir le nom" />

          <label>Prénom du candidat *</label>
          <input type="text" placeholder="Saisir le prénom" />

          <div className="row">
            <div>
              <label>Date de naissance *</label>
              <input type="date" />
            </div>

            <div>
              <label>Date d'inscription *</label>
              <input type="date" />
            </div>
          </div>

          <label>Numéro de téléphone *</label>
          <input type="text" placeholder="Saisir le numéro" />

          {/* SEXE */}
          <label>Sexe *</label>
          <div className="gender">
            <span>Homme</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
            <span>Femme</span>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="form-right">
          <div className="avatar"></div>
          <button className="upload-btn">Photo du candidat</button>
        </div>

      </div>

      {/* FOOTER */}
      <div className="modal-footer">
        <button className="btn cancel" onClick={() => setShowModal(false)}>
          Annuler
        </button>
        <button className="btn primary">
          Sauvegarder
        </button>
      </div>

    </div>
  </div>
)}


    </div>
  );
};

export default Condidats;