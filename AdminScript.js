// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔹 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhufU5KjkXXsih8qlgnwTYGEx3cYTY4zk",
  authDomain: "openday-check.firebaseapp.com",
  projectId: "openday-check",
  storageBucket: "openday-check.firebasestorage.app",
  messagingSenderId: "760148739687",
  appId: "1:760148739687:web:51046ebb13e2342642f6c2"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsCollection = collection(db, "students");

// 🔹 Elementi DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const studentContainer = document.getElementById('students-container');

// 🔹 Eventi Drag&Drop
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => { 
    e.preventDefault(); 
    dropZone.classList.remove('drag-over'); 
    handleFile(e.dataTransfer.files[0]); 
});
fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

// 🔹 Funzione per leggere file Excel e salvare su Firebase
async function handleFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length < 2) {
            alert("File Excel non valido: deve contenere almeno una riga data + una riga alunni");
            return;
        }

        // Prima riga contiene la data (es. "30/11/2025")
        const defaultDate = rows[0][0];
        const formattedDate = formatDate(defaultDate);

        // Inizia dal secondo elemento (riga 1) dove ci sono gli alunni
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 3) continue; // Salta righe incomplete
            const student = {
                opendayDate: formattedDate,
                nome: row[0],
                cognome: row[1],
                classe: row[2]
            };
            await addDoc(studentsCollection, student);
        }

        alert("Dati caricati su Firestore!");
        loadStudents(); // Ricarica dati
    };
    reader.readAsArrayBuffer(file);
}

// 🔹 Converte la data in formato YYYY-MM-DD
function formatDate(dateStr) {
    const parts = dateStr.split(/[\/.-]/);
    if (parts.length !== 3) return dateStr;
    const [day, month, year] = parts;
    return `${year.padStart(4,'0')}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
}

// 🔹 Carica studenti da Firestore e visualizza per data
async function loadStudents() {
    const snapshot = await getDocs(studentsCollection);
    const allStudents = snapshot.docs.map(doc => doc.data());

    studentContainer.innerHTML = "";
    const grouped = {};

    allStudents.forEach(stu => {
        if (!grouped[stu.opendayDate]) grouped[stu.opendayDate] = [];
        grouped[stu.opendayDate].push(stu);
    });

    const dates = Object.keys(grouped).sort((a,b) => new Date(a)-new Date(b));

    dates.forEach(date => {
        const divDate = document.createElement('h3');
        divDate.textContent = `Data: ${date}`;
        studentContainer.appendChild(divDate);

        grouped[date].forEach(stu => {
            const div = document.createElement('div');
            div.textContent = `${stu.nome} ${stu.cognome} (${stu.classe})`;
            studentContainer.appendChild(div);
        });
    });
}

// 🔹 Carica studenti al caricamento pagina
loadStudents();
