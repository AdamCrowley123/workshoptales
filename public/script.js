import { env } from './env.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configura Firebase utilizzando le variabili d'ambiente
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Script caricato correttamente'); // Debug

// Elementi del DOM
const postList = document.getElementById('post-list');
const postsContainer = document.getElementById('posts-container');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const createPostBtn = document.getElementById('createPostBtn');

// Carica i post all'avvio
window.addEventListener('load', () => {
  console.log('Pagina caricata'); // Debug
  loadPosts();
});

// Carica i post da Firestore
async function loadPosts() {
  try {
    // Mostra il loader
    document.getElementById('loader').style.display = 'block';

    // Ottieni i documenti dalla collezione "posts"
    const querySnapshot = await getDocs(collection(db, "posts"));
    const posts = [];
    querySnapshot.forEach((doc) => {
      const postData = doc.data();
      // Converti la data UTC in una data locale italiana
      const localDate = new Date(postData.createdAt).toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      posts.push({ id: doc.id, ...postData, createdAt: localDate });
    });

    // Ordina i post per data di creazione (dal più recente al più vecchio)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('Post caricati:', posts); // Debug

    // Mostra tutti i post in homepage
    postsContainer.innerHTML = posts.map(post => `
      <div class="post" id="post-${post.id}">
        <h2>${post.title}</h2>
        <small>${post.createdAt}</small>
        <div>${post.content}</div>
        ${auth.currentUser ? `
          <button class="edit-btn" data-id="${post.id}">Modifica</button>
          <button class="delete-btn" data-id="${post.id}">Cancella</button>
        ` : ''}
      </div>
    `).join('');

    // Mostra le storie nella colonna sinistra
    postList.innerHTML = posts.map(post => `
      <li>
        <a href="#post-${post.id}">${post.title}</a><br>
        <small>${post.createdAt}</small>
      </li>
    `).join('');

    // Aggiungi eventi ai pulsanti "Modifica" e "Cancella"
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const postId = e.target.getAttribute('data-id');
        window.location.href = `/editor.html?postId=${postId}`;
      });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const postId = e.target.getAttribute('data-id');
        deletePost(postId);
      });
    });
  } catch (error) {
    console.error('Errore durante il caricamento dei post:', error); // Debug
    alert('Errore durante il caricamento dei post');
  } finally {
    // Nascondi il loader
    document.getElementById('loader').style.display = 'none';
  }
}

// Cancella un post da Firestore
async function deletePost(postId) {
  if (confirm('Sei sicuro di voler cancellare questo post?')) {
    const user = auth.currentUser;
    if (!user) {
      alert('Devi essere loggato per cancellare un post');
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", postId));
      alert('Post cancellato con successo!');
      loadPosts(); // Ricarica i post
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante la cancellazione del post');
    }
  }
}

// Apri il modal di login
loginBtn.addEventListener('click', () => {
  console.log('Pulsante Login cliccato'); // Debug
  loginModal.style.display = 'block';
});

// Chiudi il modal di login
closeModal.addEventListener('click', () => {
  console.log('Pulsante Chiudi cliccato'); // Debug
  loginModal.style.display = 'none';
});

// Gestisci il login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('Login effettuato con successo!');
    loginModal.style.display = 'none';
    window.location.href = '/editor.html'; // Reindirizza all'editor
  } catch (error) {
    alert('Errore di login: ' + error.message);
  }
});

// Gestisci il logout
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    alert('Logout effettuato con successo!');
    window.location.href = '/'; // Ricarica la homepage
  } catch (error) {
    console.error('Errore durante il logout:', error);
    alert('Errore durante il logout');
  }
});

// Controlla se l'utente è loggato
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Utente loggato:', user.email); // Debug
    loginBtn.style.display = 'none'; // Nascondi il pulsante di login
    logoutBtn.style.display = 'block'; // Mostra il pulsante di logout
    createPostBtn.style.display = 'block'; // Mostra il pulsante "Crea Post"
  } else {
    console.log('Nessun utente loggato'); // Debug
    loginBtn.style.display = 'block'; // Mostra il pulsante di login
    logoutBtn.style.display = 'none'; // Nascondi il pulsante di logout
    createPostBtn.style.display = 'none'; // Nascondi il pulsante "Crea Post"
  }
});

// Gestisci il click sul pulsante "Crea Post"
createPostBtn.addEventListener('click', () => {
  window.location.href = '/editor.html'; // Reindirizza alla pagina dell'editor
});