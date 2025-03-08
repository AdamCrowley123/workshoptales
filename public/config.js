// config.js
export async function getFirebaseConfig() {
  const response = await fetch('/config'); // Richiede le variabili d'ambiente al backend
  const firebaseConfig = await response.json(); // Converte la risposta in JSON
  return firebaseConfig;
}