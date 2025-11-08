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
  const dataOpenDay = alunno.opendayDate || alunno.dataOpenDay || '';
  const input = `${alunno.nome.toLowerCase().trim()}|${alunno.cognome.toLowerCase().trim()}|${alunno.classe.trim()}|${dataOpenDay.trim()}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}