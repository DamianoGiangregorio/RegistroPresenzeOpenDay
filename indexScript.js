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
        classe: classe.value
    };

    Students = ReadData();
    if(!(CalcolaCodice(nuovo) === CalcolaCodice(Students.find(studente => studente.nome === nuovo.nome &&studente.cognome === nuovo.cognome 
        &&studente.classe === nuovo.classe))))
            alert("Generalità non corrette riprovare");
    else{
        nuovo.presenza.presente = true;
        SaveData(Students);
    }
}