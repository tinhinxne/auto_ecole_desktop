const { app, BrowserWindow, session, ipcMain } = require('electron'); // <-- NOUVEAU: ajouté ipcMain
const path = require('node:path');
const db = require('./db'); // <-- NOUVEAU: on importe ton fichier db.js

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 650,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true, // Recommandé pour la sécurité
      nodeIntegration: false,
    },
  });

  // ── Fix CSP ──
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; " +
          "img-src 'self' data: https: http:; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com data:; " +
          "connect-src 'self' https: http:;"
        ]
      }
    });
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ══════════════════════════════════════════════
//  FONCTIONS DE COMMUNICATION (IPC)
// ══════════════════════════════════════════════

// Gestion du LOGIN
ipcMain.handle('login', async (event, credentials) => {
  return new Promise((resolve, reject) => {
    const { email, password } = credentials;

    // ATTENTION: On utilise "mail" et "mot_de_passe" car c'est le nom dans TA table
    const sql = 'SELECT * FROM Utilisateur WHERE mail = ? AND mot_de_passe = ?';

    db.query(sql, [email, password], (err, result) => {
      if (err) {
        console.error("Erreur SQL:", err);
        reject(err);
      } else if (result.length > 0) {
        // Succès ! On renvoie les infos de l'utilisateur
        resolve({ 
          success: true, 
          user: { 
            id: result[0].id, 
            nom: result[0].nom, 
            type: result[0].type_utilisateur 
          } 
        });
      } else {
        // Échec
        resolve({ success: false, message: "Email ou mot de passe incorrect" });
      }
    });
  });
});