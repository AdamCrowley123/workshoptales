// Importa le funzioni di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

console.log('Script caricato correttamente'); // Debug

// Elementi del DOM
const postList = document.getElementById('post-list');
const postsContainer = document.getElementById('posts-container');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');

// Carica i post all'avvio
window.addEventListener('load', () => {
  console.log('Pagina caricata'); // Debug
  loadPosts();
});

// Carica i post
async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error('Errore durante il caricamento dei post');
    }
    const posts = await response.json();
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
  }
}

// Mostra il contenuto di un post
async function showPost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`);
    if (!response.ok) {
      throw new Error('Errore durante il caricamento del post');
    }
    const post = await response.json();

    // Crea un nuovo elemento per il post selezionato
    const selectedPost = document.createElement('div');
    selectedPost.classList.add('post');
    selectedPost.setAttribute('data-id', post.id);
    selectedPost.innerHTML = `
      <h2>${post.title}</h2>
      <small>${post.createdAt}</small>
      <div>${post.content}</div>
      ${auth.currentUser ? `
        <button class="edit-btn" data-id="${post.id}">Modifica</button>
        <button class="delete-btn" data-id="${post.id}">Cancella</button>
      ` : ''}
    `;

    // Aggiungi il post selezionato in cima alla lista
    postsContainer.prepend(selectedPost);

    // Aggiungi eventi ai pulsanti "Modifica" e "Cancella"
    selectedPost.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const postId = e.target.getAttribute('data-id');
        window.location.href = `/editor.html?postId=${postId}`;
      });
    });

    selectedPost.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const postId = e.target.getAttribute('data-id');
        deletePost(postId);
      });
    });
  } catch (error) {
    console.error('Errore durante il caricamento del post:', error);
    alert('Errore durante il caricamento del post');
  }
}

// Apri il modal di login
loginBtn.addEventListener('click', () => {
  console.log('Pulsante Login cliccato'); // Debug
  loginModal.style.display = 'block';
});

logoutBtn.addEventListener('click', async () => {
  try {
    await auth.signOut();
    alert('Logout effettuato con successo!');
    window.location.href = '/'; // Ricarica la homepage
  } catch (error) {
    console.error('Errore durante il logout:', error);
    alert('Errore durante il logout');
  }
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

// Cancella un post
async function deletePost(postId) {
  if (confirm('Sei sicuro di voler cancellare questo post?')) {
    const user = auth.currentUser;
    if (!user) {
      alert('Devi essere loggato per cancellare un post');
      return;
    }

    const idToken = await user.getIdToken();

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': idToken,
        },
      });

      if (response.ok) {
        alert('Post cancellato con successo!');
        loadPosts(); // Ricarica i post
      } else {
        alert('Errore durante la cancellazione del post');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante la cancellazione del post');
    }
  }
}

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