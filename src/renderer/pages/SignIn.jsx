import React, { useState } from 'react';
import '../../styles/SignIn.css';
import CarImage from '../../assets/Car.png';
import { useNavigate } from "react-router-dom";



const SteeringWheelIcon = () => (
  <svg
    className="signin-card__app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />s
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="4.22" y1="6.22" x2="9.17" y2="9.17" />
    <line x1="19.78" y1="6.22" x2="14.83" y2="9.17" />
    <line x1="12" y1="22" x2="12" y2="15" />
    <line x1="4.22" y1="17.78" x2="9.17" y2="14.83" />
    <line x1="19.78" y1="17.78" x2="14.83" y2="14.83" />
  </svg>
);

const EmailIcon = () => (
  <svg
    className="signin-form__field-icon"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0
      2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const LockIcon = () => (
  <svg
    className="signin-form__field-icon"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1
      0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9
      2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2
      2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71
      1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Connexion :', { email, password });
    navigate("/access");
  };

  return (
    <div className="signin-page" style={{ backgroundImage: `url(${CarImage})` }}>

      {/* ── Images de fond ── */}
      {/* Remplace les src par tes assets réels */}
      <img
        src="../../assets/Car.png"
        alt=""
        aria-hidden="true"
        className="signin-page__bg-image signin-page__bg-image--instructor"
      />
      <img
        src="../../assets/Car.png"
        alt=""
        aria-hidden="true"
        className="signin-page__bg-image signin-page__bg-image--car"
      />

      {/* ── Carte de connexion ── */}
      <div className="signin-card">

        {/* Logo + nom de l'appli */}
        <div className="signin-card__app-header">
          <SteeringWheelIcon />
          <span className="signin-card__app-title">Ecole de Conduite</span>
        </div>

        {/* Titre */}
        <h1 className="signin-card__title">Connexion</h1>

        {/* Bandeau sous-titre */}
        <div className="signin-card__subtitle-band">
          <p className="signin-card__subtitle">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form className="signin-form" onSubmit={handleSubmit}>

          {/* Champ e-mail */}
          <div className="signin-form__field">
            <EmailIcon />
            <input
              className="signin-form__input"
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Champ mot de passe */}
          <div className="signin-form__field">
            <LockIcon />
            <input
              className="signin-form__input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Mot de passe oublié */}
          <div className="signin-form__forgot">
            <a href="#" className="signin-form__forgot-link">
              Mot de passe oublié ?
            </a>
          </div>

          {/* Bouton */}
          <button type="submit" className="signin-form__submit">
            Se connecter
          </button>

        </form>
      </div>
    </div>
  );
}
