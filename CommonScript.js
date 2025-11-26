export function SaveData(students) {
  localStorage.setItem('Students', JSON.stringify(students));
}

export async function ReadData() {
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
  return Students;
}

export async function AddData(nuovo) {
  let Students = await ReadData();

  Students.push(nuovo);
  SaveData(Students);
}

export function CalcolaCodice(alunno) {

  function pulisci(valore) {
    return String(valore || "")
      .toLowerCase()
      .trim()
      .replace(/'/g, "")               // rimuove apostrofi
      .replace(/\s+/g, "")             // rimuove spazi
      .normalize("NFD")                // separa accenti
      .replace(/[\u0300-\u036f]/g, "");// rimuove accenti
  }

  const dataOpenDay = pulisci(alunno.opendayDate || alunno.dataOpenDay || '');
  const nome = pulisci(alunno.nome);
  const cognome = pulisci(alunno.cognome);
  const classe = pulisci(alunno.classe);

  const input = `${nome}|${cognome}|${classe}|${dataOpenDay}`;

  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }

  return (hash >>> 0).toString(16);
}