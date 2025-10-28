import * as common from './CommonScript.js';
function VerificaPresenza() {
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
        data: new Date().toLocaleDateString('it-IT').substring(0,5)
    };

    Students = ReadData();
    if(CalcolaCodice(nuovo) === CalcolaCodice(Students.find(studente => studente.nome === nuovo.nome &&studente.cognome === nuovo.cognome 
        &&studente.classe === nuovo.classe &&studente.data === nuovo.data)))
        return 

}

