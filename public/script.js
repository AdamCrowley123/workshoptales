import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

let db, auth;
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const createPostBtn = document.getElementById("create-post-btn");

async function getFirebaseConfig() {
    try {
        const response = await fetch("/firebase-config.json");
        if (!response.ok) {
            throw new Error("Errore nel recupero del file di configurazione Firebase");
        }
        return await response.json();
    } catch (error) {
        console.error("Errore nel recupero della configurazione Firebase:", error);
        alert("Errore nel recupero della configurazione Firebase");
        throw error;
    }
}

async function initializeFirebase() {
    try {
        const firebaseConfig = await getFirebaseConfig();
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log("Firebase inizializzato correttamente");

        // Controlla lo stato dell'autenticazione solo dopo l'inizializzazione
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Utente loggato:", user.email);
                loginBtn.style.display = "none";
                logoutBtn.style.display = "block";
                createPostBtn.style.display = "block";
            } else {
                console.log("Nessun utente loggato");
                loginBtn.style.display = "block";
                logoutBtn.style.display = "none";
                createPostBtn.style.display = "none";
            }
        });
        
        loadPosts(); // Carica i post solo dopo l'inizializzazione di Firestore
    } catch (error) {
        console.error("Errore durante l'inizializzazione di Firebase:", error);
        alert("Errore durante l'inizializzazione di Firebase");
    }
}

async function loadPosts() {
    try {
        if (!db) {
            console.error("Firestore non è stato inizializzato correttamente.");
            return;
        }
        document.getElementById("loader").style.display = "block";
        const querySnapshot = await getDocs(collection(db, "posts"));
        const postList = document.getElementById("post-list");
        postList.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `<h2>${postData.title}</h2><p>${postData.content}</p>`;
            postList.appendChild(postElement);
        });

        document.getElementById("loader").style.display = "none";
    } catch (error) {
        console.error("Errore nel caricamento dei post:", error);
        alert("Errore nel caricamento dei post");
    }
}

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("Utente disconnesso");
    } catch (error) {
        console.error("Errore durante il logout:", error);
        alert("Errore durante il logout");
    }
});

document.addEventListener("DOMContentLoaded", initializeFirebase);
