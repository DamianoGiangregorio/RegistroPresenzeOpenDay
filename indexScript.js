import { CalcolaCodice } from "./CommonScript.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhufU5KjkXXsih8qlgnwTYGEx3cYTY4zk",
  authDomain: "openday-check.firebaseapp.com",
  projectId: "openday-check",
  storageBucket: "openday-check.firebasestorage.app",
  messagingSenderId: "760148739687",
  appId: "1:760148739687:web:51046ebb13e2342642f6c2"
};

// Inizializza Firebase (modulare)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("hero-form");
  form.addEventListener("submit", SendData);
});

async function SendData(event) {
  event.preventDefault();

  const nome = document.getElementById("hero-nome").value.trim().toLowerCase();
  const cognome = document.getElementById("hero-cognome").value.trim().toLowerCase();
  const classe = document.getElementById("hero-classe").value.trim().toLowerCase();
  const codiceInseritoRaw = document.getElementById("hero-codice").value;

  // Normalizzo codice inserito: minuscolo e trim
  const codiceInserito = codiceInseritoRaw.trim().toLowerCase();

  // Data oggi in formato d/m/yyyy (senza leading zero)
  const oggi = new Date();
  const giorno = oggi.getDate();
  const mese = oggi.getMonth() + 1;
  const anno = oggi.getFullYear();
  const dataOggi = `${giorno}/${mese}/${anno}`;

  try {
    const studentsCol = collection(db, "students");
    const snapshot = await getDocs(studentsCol);

    let recordTrovato = null;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

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
        recordTrovato = { id: docSnap.id, data };
      }
    });

    if (!recordTrovato) {
      alert("Nessun record trovato con i dati forniti per la data di oggi.\nProva a verificare che i dati siano scritti correttamente");
      return;
    }

    // Calcola codice con la funzione corretta (CalcolaCodice ora prende un oggetto)
    let codiceCalcolato = CalcolaCodice(recordTrovato.data);

    // Normalizzo codice calcolato per confronto (minuscolo e trim)
    codiceCalcolato = codiceCalcolato.trim().toLowerCase();


    if (codiceCalcolato === codiceInserito) {
      const studentDoc = doc(db, "students", recordTrovato.id);
      await updateDoc(studentDoc, { presenza: true });
      alert("Presenza verificata con successo!");
    } else {
      alert("Codice di verifica errato. Controlla e riprova.");
    }
  } catch (error) {
    alert("Errore nel controllo dati. Riprova più tardi.");
  }
}
