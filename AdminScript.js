// Elementi DOM
const openUploadModalButton = document.getElementById('openUploadModal');
const uploadModal = document.getElementById('uploadModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalButton = document.getElementById('closeModal');
const cancelUploadButton = document.getElementById('cancelUpload');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const submitFilesButton = document.getElementById('submitFiles');
const uploadStatus = document.getElementById('uploadStatus');

// Array per memorizzare i file selezionati
let selectedFiles = [];

// Apri il modal
openUploadModalButton.addEventListener('click', () => {
    uploadModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

// Chiudi il modal
function closeModal() {
    uploadModal.style.display = 'none';
    document.body.style.overflow = '';
}

closeModalButton.addEventListener('click', closeModal);
cancelUploadButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Click sull'area di drop per aprire la selezione file
dropZone.addEventListener('click', (e) => {
    // Impedisce che il click si propaghi al modal overlay
    e.stopPropagation();
    fileInput.click();
});

// Gestione selezione file tramite input
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Gestione drag & drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});

// Funzione per gestire i file selezionati
function handleFiles(files) {
    // Aggiungi i nuovi file all'array
    Array.from(files).forEach(file => {
        // Verifica che il file non sia già stato aggiunto
        const isDuplicate = selectedFiles.some(
            existingFile => existingFile.name === file.name && existingFile.size === file.size
        );
        
        // Verifica dimensione massima (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showStatus(`Il file "${file.name}" supera la dimensione massima di 10MB`, 'error');
            return;
        }
        
        if (!isDuplicate) {
            selectedFiles.push(file);
        } else {
            showStatus(`Il file "${file.name}" è già stato selezionato`, 'info');
        }
    });
    
    // Aggiorna la visualizzazione
    updateFileList();
    
    // Abilita il pulsante di invio se ci sono file
    submitFilesButton.disabled = selectedFiles.length === 0;
}

// Aggiorna la lista dei file visualizzata
function updateFileList() {
    fileList.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '<p class="empty-message">Nessun file selezionato</p>';
        return;
    }
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSize = formatFileSize(file.size);
        const fileType = getFileType(file.name);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon-small">${getFileIcon(fileType)}</span>
                <div class="file-details">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${fileSize}</span>
                        <span class="file-type">${fileType.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            <button class="remove-file" data-index="${index}" aria-label="Rimuovi file">
                ×
            </button>
        `;
        
        fileList.appendChild(fileItem);
    });
    
    // Aggiungi event listener per i pulsanti di rimozione
    document.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            removeFile(index);
        });
    });
}

// Rimuove un file dalla lista
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    
    // Disabilita il pulsante di invio se non ci sono più file
    submitFilesButton.disabled = selectedFiles.length === 0;
}

// Formatta la dimensione del file in modo leggibile
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Determina il tipo di file in base all'estensione
function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
        // Immagini
        'jpg': 'immagine', 'jpeg': 'immagine', 'png': 'immagine', 
        'gif': 'immagine', 'bmp': 'immagine', 'svg': 'immagine', 'webp': 'immagine',
        
        // Documenti
        'pdf': 'documento', 'doc': 'documento', 'docx': 'documento',
        'txt': 'documento', 'rtf': 'documento',
        
        // Fogli di calcolo
        'xls': 'foglio', 'xlsx': 'foglio', 'csv': 'foglio',
        
        // Presentazioni
        'ppt': 'presentazione', 'pptx': 'presentazione',
        
        // Archivi
        'zip': 'archivio', 'rar': 'archivio', '7z': 'archivio', 'tar': 'archivio',
        
        // Altro
        'mp3': 'audio', 'wav': 'audio', 'mp4': 'video', 'avi': 'video'
    };
    
    return typeMap[extension] || 'file';
}

// Restituisce l'icona appropriata per il tipo di file
function getFileIcon(fileType) {
    const iconMap = {
        'immagine': '🖼️',
        'documento': '📄',
        'foglio': '📊',
        'presentazione': '📑',
        'archivio': '📦',
        'audio': '🎵',
        'video': '🎬',
        'file': '📁'
    };
    
    return iconMap[fileType] || '📁';
}

// Gestione dell'invio dei file
submitFilesButton.addEventListener('click', () => {
    if (selectedFiles.length === 0) {
        showStatus('Seleziona almeno un file da caricare', 'error');
        return;
    }
    
    // Simula l'invio dei file (in un caso reale, qui andrebbe una chiamata AJAX)
    simulateUpload();
});

// Funzione per simulare l'upload (sostituire con codice reale)
function simulateUpload() {
    submitFilesButton.disabled = true;
    submitFilesButton.innerHTML = '<span class="button-icon">⏳</span> Caricamento in corso...';
    
    // Simula un ritardo di caricamento
    setTimeout(() => {
        showStatus(`Caricamento completato! ${selectedFiles.length} file caricati con successo.`, 'success');
        
        // Resetta il form
        selectedFiles = [];
        updateFileList();
        fileInput.value = '';
        submitFilesButton.innerHTML = '<span class="button-icon">🚀</span> Carica File Selezionati';
        submitFilesButton.disabled = true;
        
        // Chiudi il modal dopo 2 secondi
        setTimeout(() => {
            closeModal();
        }, 2000);
    }, 2000);
}

// Mostra messaggi di stato
function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = 'upload-status ' + type;
    
    // Nasconde il messaggio dopo 5 secondi
    setTimeout(() => {
        uploadStatus.className = 'upload-status';
    }, 5000);
}

// Gestione della tastiera per accessibilità
document.addEventListener('keydown', (e) => {
    // ESC per chiudere il modal
    if (e.key === 'Escape' && uploadModal.style.display === 'block') {
        closeModal();
    }
});

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    updateFileList();
});