import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { CalcolaCodice } from '../CommonScript.js';

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhufU5KjkXXsih8qlgnwTYGEx3cYTY4zk",
  authDomain: "openday-check.firebaseapp.com",
  projectId: "openday-check",
  storageBucket: "openday-check.firebasestorage.app",
  messagingSenderId: "760148739687",
  appId: "1:760148739687:web:51046ebb13e2342642f6c2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsCollection = collection(db, "students");

// Elementi DOM
const studentContainer = document.getElementById('students-container');
const fileInput = document.getElementById('fileInput');
const downloadExcelBtn = document.getElementById('download-excel');

// ======== LETTURA FILE XLSX ==========

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return alert("Nessun file selezionato.");

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      alert("Il file Excel è vuoto o non valido.");
      return;
    }

    const promises = rows.map(async (row, index) => {
      if (!row.Nome || !row.Cognome || !row.Classe || !row.OpendayDate) {
        return null; // salto righe incomplete senza warning
      }
      try {
        await addDoc(studentsCollection, {
          nome: row.Nome,
          cognome: row.Cognome,
          classe: row.Classe,
          opendayDate: row.OpendayDate,
          presenza: false
        });
      } catch(error) {
        console.error("Errore durante inserimento documento:", error);
      }
    });

    await Promise.all(promises);

    alert("Caricamento dati terminato.");
    loadStudents();
  } catch(error) {
    console.error("Errore durante la lettura del file Excel:", error);
    alert("Errore durante la lettura del file Excel.");
  }
});

// ======== LETTURA STUDENTI DA FIRESTORE ==========

async function loadStudents() {
  try {
    const snapshot = await getDocs(studentsCollection);

    if (snapshot.empty) {
      studentContainer.textContent = "Nessun studente caricato.";
      return;
    }

    const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Raggruppa per data
    const grouped = {};
    allStudents.forEach(stu => {
      if (!stu.opendayDate) return;
      if (!grouped[stu.opendayDate]) grouped[stu.opendayDate] = [];
      grouped[stu.opendayDate].push(stu);
    });

    const dates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

    studentContainer.innerHTML = '';

    // SELECT per scegliere data
    const selectDate = document.createElement('select');
    selectDate.id = 'select-date';
    selectDate.style.marginBottom = '10px';
    dates.forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      selectDate.appendChild(option);
    });
    studentContainer.appendChild(selectDate);

    // Pulsante per eliminare tutti gli studenti di una data
    const btnDeleteDate = document.createElement('button');
    btnDeleteDate.textContent = 'Elimina tutti studenti di questa data';
    btnDeleteDate.classList.add('btn', 'btn-primary', 'btn-lg');
    btnDeleteDate.style.marginLeft = '10px';
    studentContainer.appendChild(btnDeleteDate);

    const tableContainer = document.createElement('div');
    tableContainer.style.marginTop = '10px';
    studentContainer.appendChild(tableContainer);

    function showTable(date) {
      const students = grouped[date] || [];
      tableContainer.innerHTML = '';

      if (students.length === 0) {
        tableContainer.textContent = "Nessuno studente per questa data.";
        return;
      }

      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';

      const thead = document.createElement('thead');

      // RIGA TITOLO che occupa 5 colonne (aggiunto presenza)
      const trTitle = document.createElement('tr');
      const thTitle = document.createElement('th');
      thTitle.colSpan = 5;  // ora 5 colonne
      thTitle.textContent = `Alunni data: ${date}`;
      thTitle.style.textAlign = 'center';
      thTitle.style.padding = '12px';
      thTitle.style.fontSize = '1.2em';
      thTitle.style.backgroundColor = '#f0f0f0';
      trTitle.appendChild(thTitle);
      thead.appendChild(trTitle);

      // RIGA INTESTAZIONI (aggiunto presenza)
      const trHead = document.createElement('tr');
      ['Nome', 'Cognome', 'Classe', 'Codice', 'Presenza'].forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.border = '1px solid #ccc';
        th.style.padding = '8px';
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);

      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      students.forEach(stu => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.title = "Clicca per eliminare questo studente";

        tr.addEventListener('click', async () => {
          if (confirm(`Eliminare studente ${stu.nome} ${stu.cognome}?`)) {
            try {
              await deleteDoc(doc(db, 'students', stu.id));
              alert("Studente eliminato.");
              loadStudents();
            } catch(error) {
              console.error("Errore durante eliminazione studente:", error);
              alert("Errore durante eliminazione studente.");
            }
          }
        });

        // Colonne: Nome, Cognome, Classe, Codice, Presenza (questa volta testo esplicito)
        const presenzaTesto = stu.presenza ? 'Presente' : 'Assente';
        [stu.nome, stu.cognome, stu.classe, CalcolaCodice(stu), presenzaTesto].forEach(val => {
          const td = document.createElement('td');
          td.textContent = val;
          td.style.border = '1px solid #ccc';
          td.style.padding = '8px';
          td.style.textAlign = 'left';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tableContainer.appendChild(table);
    }

    selectDate.addEventListener('change', () => showTable(selectDate.value));

    btnDeleteDate.addEventListener('click', async () => {
      const dateToDelete = selectDate.value;
      if (!confirm(`Eliminare tutti gli studenti della data ${dateToDelete}?`)) return;
      try {
        const q = query(studentsCollection, where('opendayDate', '==', dateToDelete));
        const querySnapshot = await getDocs(q);
        await Promise.all(querySnapshot.docs.map(d => deleteDoc(doc(db, 'students', d.id))));
        alert(`Eliminati tutti gli studenti della data ${dateToDelete}`);
        loadStudents();
      } catch(error) {
        console.error("Errore durante eliminazione studenti per data:", error);
        alert("Errore durante eliminazione studenti.");
      }
    });

    showTable(dates[0]);

    // Salvo variabili globali per download
    window._groupedStudents = grouped;
    window._selectedDate = dates[0];
    selectDate.addEventListener('change', () => {
      window._selectedDate = selectDate.value;
    });

  } catch(error) {
    console.error("Errore durante il caricamento degli studenti:", error);
    studentContainer.textContent = "Errore durante il caricamento degli studenti.";
  }
}

// --- BOTTONE DOWNLOAD FILE EXAMPLE ---
const downloadBtn = document.getElementById('download-example');
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = './example.xlsx';
    link.download = 'example.xlsx';
    link.click();
  });
}

// --- BOTTONE DOWNLOAD XLSX STUDENTI FILTRATI ---
if (downloadExcelBtn) {
  downloadExcelBtn.addEventListener('click', () => {
    const grouped = window._groupedStudents;
    const selectedDate = window._selectedDate;
    if (!grouped || !selectedDate || !grouped[selectedDate]) {
      alert("Nessun dato disponibile per il download.");
      return;
    }

    const dataToExport = grouped[selectedDate].map(s => ({
      Nome: s.nome,
      Cognome: s.cognome,
      Classe: s.classe,
      Codice: CalcolaCodice(s),
      Presenza: s.presenza ? "Presente" : "Assente"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Studenti");
    XLSX.writeFile(wb, `studenti_${selectedDate}.xlsx`);
  });
}

loadStudents();
