import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import CalcolaCodice from './CommonScript.js';

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

async function loadStudents() {
  console.log("Inizio caricamento studenti...");
  try {
    const snapshot = await getDocs(studentsCollection);
    console.log("Snapshot ricevuto:", snapshot);
    console.log(`Numero documenti trovati: ${snapshot.size}`);

    if (snapshot.size === 0) {
      studentContainer.textContent = "Nessun studente caricato.";
      return;
    }

    const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Students caricati:", allStudents);

    // Raggruppa per data
    const grouped = {};
    allStudents.forEach(stu => {
      if (!stu.opendayDate) console.warn("Studente senza opendayDate:", stu);
      if (!grouped[stu.opendayDate]) grouped[stu.opendayDate] = [];
      grouped[stu.opendayDate].push(stu);
    });

    const dates = Object.keys(grouped).sort((a,b) => new Date(a) - new Date(b));

    studentContainer.innerHTML = '';

    // CREA SELECT per scegliere data
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

    // Pulsante per eliminare tutta la data selezionata
    const btnDeleteDate = document.createElement('button');
    btnDeleteDate.textContent = 'Elimina tutti studenti di questa data';
    btnDeleteDate.style.marginLeft = '10px';
    studentContainer.appendChild(btnDeleteDate);

    // Contenitore tabella
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
      const trHead = document.createElement('tr');
      ['Nome', 'Cognome', 'Classe', 'Codice'].forEach(h => {
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
            } catch (e) {
              alert("Errore durante eliminazione studente.");
              console.error(e);
            }
          }
        });

        [stu.nome, stu.cognome, stu.classe, CalcolaCodice(stu)].forEach(val => {
          const td = document.createElement('td');
          td.textContent = val;
          td.style.border = '1px solid #ccc';
          td.style.padding = '8px';
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tableContainer.appendChild(table);
    }

    selectDate.addEventListener('change', () => {
      showTable(selectDate.value);
    });

    btnDeleteDate.addEventListener('click', async () => {
      const dateToDelete = selectDate.value;
      if (!dateToDelete) return;
      if (!confirm(`Eliminare TUTTI gli studenti della data ${dateToDelete}?`)) return;

      try {
        const q = query(studentsCollection, where('opendayDate', '==', dateToDelete));
        const querySnapshot = await getDocs(q);

        const promises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'students', d.id)));
        await Promise.all(promises);

        alert(`Eliminati tutti gli studenti della data ${dateToDelete}`);
        loadStudents();
      } catch (e) {
        alert("Errore durante eliminazione studenti.");
        console.error(e);
      }
    });

    showTable(dates[0]);
  } catch(e) {
    console.error("Errore caricamento studenti:", e);
    studentContainer.textContent = "Errore durante il caricamento degli studenti.";
  }
}

loadStudents();
