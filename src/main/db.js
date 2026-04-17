const mysql = require("mysql2");

// On crée une connexion à la base de données
const db = mysql.createConnection({
  host: "localhost",
  user: "auto_user",
  password: "Fitmanager@2026", // Mets ici le mot de passe que tu as tapé dans le terminal
  database: "auto_ecole_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL:", err.message);
  } else {
    console.log("✅ Connecté à la base de données Auto-École !");
  }
});

module.exports = db;
