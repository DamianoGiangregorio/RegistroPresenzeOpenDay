import CalcolaCodice from "./CommonScript.js";

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhufU5KjkXXsih8qlgnwTYGEx3cYTY4zk",
  authDomain: "openday-check.firebaseapp.com",
  projectId: "openday-check",
  storageBucket: "openday-check.firebasestorage.app",
  messagingSenderId: "760148739687",
  appId: "1:760148739687:web:51046ebb13e2342642f6c2"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("hero-form");
  form.addEventListener("submit", SendData);
});

async function SendData(event) {
  event.preventDefault();

  // Prendi i valori dal form e metti tutto in minuscolo e trim
  const nome = document.getElementById("hero-nome").value.trim().toLowerCase();
  const cognome = document.getElementById("hero-cognome").value.trim().toLowerCase();
  const classe = document.getElementById("hero-classe").value.trim().toLowerCase();
  const codiceInserito = document.getElementById("hero-codice").value.trim();

  // Ottieni la data di oggi in formato d/m/yyyy
  const oggi = new Date();
  const giorno = oggi.getDate();
  const mese = oggi.getMonth() + 1;
  const anno = oggi.getFullYear();
  const dataOggi = `${giorno}/${mese}/${anno}`;

  try {
    const snapshot = await db.collection("students").get();

    let recordTrovato = null;

    snapshot.forEach(doc => {
      const data = doc.data();

      const nomeDB = (data.nome || "").toLowerCase().trim();
      const cognomeDB = (data.cognome || "").toLowerCase().trim();
      const classeDB = (data.classe || "").toLowerCase().trim();
      const opendayDateDB = (data.opendayDate || "").toLowerCase().trim();

      if (
        nomeDB === nome &&
        cognomeDB === cognome &&
        classeDB === classe &&
        opendayDateDB === dataOggi.toLowerCase()
      ) {
        recordTrovato = { id: doc.id, data };
      }
    });

    if (!recordTrovato) {
      alert("Nessun record trovato con i dati forniti per la data di oggi.");
      return;
    }

    const codiceCalcolato = CalcolaCodice(
      recordTrovato.data.nome.toLowerCase().trim(),
      recordTrovato.data.cognome.toLowerCase().trim(),
      recordTrovato.data.classe.toLowerCase().trim(),
      recordTrovato.data.opendayDate.toLowerCase().trim()
    );

    if (codiceCalcolato === codiceInserito) {
      await db.collection("students").doc(recordTrovato.id).update({ presenza: true });
      alert("Presenza verificata con successo!");
    } else {
      alert("Codice di verifica errato. Controlla e riprova.");
    }
  } catch (error) {
    alert("Errore nel controllo dati. Riprova più tardi.");
  }
}
