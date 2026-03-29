import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import AddButton from "../components/Button";
import "../../styles/condidats.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import {SquarePen,Trash,Search,UserRound,Camera,Phone} from "lucide-react";
import { TbBackground } from "react-icons/tb";



const Condidats = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container">
      <Sidebar />

      <div className="main">
        {/* HEADER */}
        <div className="header">
            <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1><img src={SmallCar} alt="" width={40}/> Panneau de contrôle de l'auto-école</h1>
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
  <div className="search-wrapper">
    <Search size={16} className="search-icon" />
    <input
      type="text"
      placeholder="Search candidates..."
      className="search"
    />
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
              <tr>
                <td>Belarbi Tinhinane</td>
                <td><Phone size={15}/> 06 12 34 56 78</td>
                <td>2025-01-15</td>
              <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">18/30 sessions</span>
</td>

                <td>Jean Dupont</td>
                <td><span className="status active">Active</span></td>
                <td className="actions"><SquarePen size={17} color="blue"/><Trash size={17} color="red"/></td>
              </tr>

              <tr>
                <td>Azil Melissa</td>
                <td><Phone size={15}/> 06 23 45 67 89</td>
                <td>2025-02-01</td>
               <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">12/30 sessions</span>
</td>

                <td>Sophie Laurent</td>
                <td><span className="status active">Active</span></td>
                <td className="actions"><SquarePen size={17} color="blue"/><Trash size={17} color="red"/></td>
              </tr>

              <tr>
                <td>Bouariche Nadine</td>
                <td><Phone size={15}/> 06 34 56 78 90</td>
                <td>2025-03-10</td>
               <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">25/30 sessions</span>
</td>

                <td>Jean Dupont</td>
                <td><span className="status pending">Pending</span></td>
                <td className="actions"><SquarePen size={17} color="blue"/><Trash size={17} color="red"/></td>
              </tr>
               <tr>
                <td>Benazzouz Sonia</td>
                <td><Phone size={15}/> 06 34 56 78 90</td>
                <td>2025-03-10</td>
               <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">22/30 sessions</span>
</td>

                <td>Jean Dupont</td>
                <td><span className="status pending">Pending</span></td>
                <td className="actions"><SquarePen size={17} color="blue"/><Trash size={17} color="red"/></td>
              </tr>
               <tr>
                <td>Albane Amina</td>
                <td><Phone size={15}/> 06 34 56 78 90</td>
                <td>2025-03-10</td>
               <td>
  <div className="progress-container">
    <div className="progress-bar" style={{ width: "60%" }}></div>
  </div>
  <span className="progress-text">129/30 sessions</span>
</td>

                <td>Jean Dupont</td>
                <td><span className="status active">Active</span></td>
                <td className="actions"><SquarePen size={17} color="blue"/><Trash size={17} color="red"/></td>
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

          <label>Nom du candidat <span>*</span></label>
          <input type="text" placeholder="Saisir le nom" />

          <label>Prénom du candidat <span>*</span></label>
          <input type="text" placeholder="Saisir le prénom" />

          <div className="row">
            <div>
              <label>Date de naissance <span>*</span></label>
              <input type="date" />
            </div>

            <div>
              <label>Date d'inscription <span>*</span></label>
              <input type="date" />
            </div>
          </div>

          <label>Numéro de téléphone <span>*</span></label>
          <input type="text" placeholder="Saisir le numéro" />

          {/* SEXE */}
          <label>Sexe <span>*</span></label>
         <div className="gender">
  
    <input type="radio" name="sexe" value="homme" id="homme" />
   
  <label for="homme">Homme</label>

  
    <input type="radio" name="sexe" value="femme" id="femme"/>
    
  <label for="femme">Femme</label>
</div>


        </div>

        {/* RIGHT IMAGE */}
        <div className="form-right">
  <div className="avatar">
    <UserRound size={40} className="avatar-icon" fill="1E2940"  color="1E2940"/>

    {/* bouton upload */}
    <div className="avatar-upload">
      <Camera size={14} />
    </div>
  </div>

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