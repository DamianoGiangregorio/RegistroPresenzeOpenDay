function SaveData(students) {
    localStorage.setItem('Students', JSON.stringify(students));
}


async function ReadData() {
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

async function AddData(nuovo) {
    let Students = ReadData();

    Students.push(nuovo);
    saveStudentData(Students);
}

export default function CalcolaCodice(alunno) {
    return "ciao";
}