// Importa le funzioni di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDn6WURTmj-_anuNTr3m6OIchBiuywXv1I", // Sostituisci con la tua chiave API
  authDomain: "horrorblog-e526c.firebaseapp.com",
  projectId: "horrorblog-e526c",
  storageBucket: "horrorblog-e526c.appspot.com",
  messagingSenderId: "111383678612793336542",
  appId: "1:111383678612793336542:web:abc123def456"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Editor script caricato correttamente'); // Debug

// Elementi del DOM
const editorContainer = document.getElementById('editor-container');
const savePostBtn = document.getElementById('savePostBtn');
const imageModal = document.getElementById('imageModal');
const imageUrlInput = document.getElementById('imageUrl');
const insertImageBtn = document.getElementById('insertImageBtn');
const closeModal = document.querySelector('.close');

// Configura Quill
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // Formattazione del testo
      [{ 'header': [1, 2, 3, false] }], // Intestazioni
      [{ 'align': [] }], // Allineamento del testo (sinistra, centro, destra, giustificato)
      ['image'], // Pulsante per caricare immagini
    ],
  },
});

// Ottieni l'ID del post dall'URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postId');

// Carica il contenuto del post se è in modalità modifica
if (postId) {
  loadPostForEditing(postId);
}

// Funzione per caricare il post da modificare
async function loadPostForEditing(postId) {
  try {
    const postDoc = await getDoc(doc(db, "posts", postId));
    if (postDoc.exists()) {
      const post = postDoc.data();
      quill.root.innerHTML = post.content; // Carica il contenuto nell'editor
      document.getElementById('postTitle').value = post.title; // Carica il titolo
    } else {
      alert('Post non trovato');
    }
  } catch (error) {
    console.error('Errore durante il caricamento del post:', error); // Debug
    alert('Errore durante il caricamento del post');
  }
}

// Apri la finestra modale quando si clicca sul pulsante "Immagine"
quill.getModule('toolbar').addHandler('image', () => {
  imageModal.style.display = 'block';
});

// Inserisci l'immagine nell'editor
insertImageBtn.addEventListener('click', () => {
  const imageUrl = imageUrlInput.value;
  if (imageUrl) {
    // Assicurati che l'editor abbia il focus
    quill.focus();

    // Ottieni la posizione del cursore
    const range = quill.getSelection();

    // Se non c'è una selezione valida, inserisci l'immagine alla fine del contenuto
    const index = range ? range.index : quill.getLength();

    // Inserisci l'immagine
    quill.insertEmbed(index, 'image', imageUrl);

    // Chiudi la finestra modale
    imageModal.style.display = 'none';

    // Resetta il campo di input
    imageUrlInput.value = '';
  } else {
    alert('Inserisci un URL valido per l\'immagine');
  }
});

// Chiudi la finestra modale
closeModal.addEventListener('click', () => {
  imageModal.style.display = 'none';
});

// Chiudi la finestra modale se si clicca fuori da essa
window.addEventListener('click', (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = 'none';
  }
});

// Controlla se l'utente è loggato
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Se l'utente non è loggato, reindirizza alla homepage
    window.location.href = '/';
  } else {
    console.log('Utente loggato:', user.email); // Debug
  }
});

// Gestisci il salvataggio del post
savePostBtn.addEventListener('click', async () => {
  const content = quill.root.innerHTML;
  const title = document.getElementById('postTitle').value;

  if (title) {
    const user = auth.currentUser;
    if (!user) {
      alert('Devi essere loggato per creare un post');
      return;
    }

    try {
      const postData = {
        title,
        content,
        createdAt: new Date().toISOString(),
        author: user.email,
      };

      if (postId) {
        // Modifica un post esistente
        await updateDoc(doc(db, "posts", postId), postData);
        alert('Post modificato con successo!');
      } else {
        // Crea un nuovo post
        await addDoc(collection(db, "posts"), postData);
        alert('Post creato con successo!');
      }

      window.location.href = '/'; // Torna alla homepage
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il salvataggio del post');
    }
  } else {
    alert('Inserisci un titolo per il post');
  }
});