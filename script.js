function saveStudentData(students) {
    localStorage.setItem('Students', JSON.stringify(students));
}

async function SendData(event) {
    event.preventDefault();

    let Students = [];
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        Students = await response.json();
    } catch (error) {
        console.error("Could not load student data:", error);
    }

    let nome = document.getElementById("hero-nome");
    let cognome = document.getElementById("hero-cognome");
    let classe = document.getElementById("hero-classe");
    let codice = document.getElementById("hero-codice");

    if (!nome.value || !cognome.value || !classe.value || !codice.value) {
        alert("Per favore, compila tutti i campi.");
        return;
    }

    let nuovo = {
        nome: nome.value,
        cognome: cognome.value,
        classe: classe.value,
        codice: codice.value,
        data: new Date().toLocaleDateString('it-IT')
    };

    Students.push(nuovo);
    saveStudentData(Students);

    alert("Registrazione completata per " + nuovo.nome + " " + nuovo.cognome + "!");

    event.target.reset();
}