// config.js
export async function getFirebaseConfig() {
  const response = await fetch('/.netlify/functions/config'); // Richiede le variabili d'ambiente alla funzione Netlify
  const firebaseConfig = await response.json(); // Converte la risposta in JSON
  return firebaseConfig;
}