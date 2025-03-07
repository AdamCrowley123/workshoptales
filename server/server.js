const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
const port = 3000;

// Configura Firebase
const serviceAccount = require('./firebase-key.json'); // Usa il file che hai scaricato
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Middleware
app.use(express.json({ limit: '10mb' })); // Aumenta il limite del payload a 10MB
app.use(express.static(path.join(__dirname, '../public'))); // Serve file statici dalla cartella "public"

// Middleware di autenticazione
const authMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) {
    return res.status(401).send('Accesso non autorizzato');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Token non valido');
  }
};

// API per ottenere i post
// API per ottenere i post
app.get('/api/posts', async (req, res) => {
  try {
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.orderBy('createdAt', 'desc').get(); // Ordina per data decrescente
    const posts = [];
    snapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    console.log('Post recuperati dal database:', posts); // Debug
    res.json(posts);
  } catch (error) {
    console.error('Errore durante il recupero dei post:', error); // Debug
    res.status(500).send('Errore durante il recupero dei post');
  }
});

// API per ottenere un singolo post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const doc = await postRef.get();
    if (!doc.exists) {
      res.status(404).send('Post non trovato');
    } else {
      res.json({ id: doc.id, ...doc.data() });
    }
  } catch (error) {
    console.error('Errore durante il recupero del post:', error);
    res.status(500).send('Errore durante il recupero del post');
  }
});

// API per creare un nuovo post (protetta da autenticazione)
app.post('/api/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  try {
    const postRef = db.collection('posts').doc();
    const createdAt = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }); // Data e ora italiana
    await postRef.set({ title, content, createdAt });
    res.send('Post creato');
  } catch (error) {
    console.error('Errore durante la creazione del post:', error);
    res.status(500).send('Errore durante la creazione del post');
  }
});

// API per modificare un post (protetta da autenticazione)
app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  try {
    const postRef = db.collection('posts').doc(req.params.id);
    await postRef.update({ title, content }); // Aggiorna sia il titolo che il contenuto
    res.send('Post modificato');
  } catch (error) {
    console.error('Errore durante la modifica del post:', error);
    res.status(500).send('Errore durante la modifica del post');
  }
});

// API per cancellare un post (protetta da autenticazione)
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const postRef = db.collection('posts').doc(req.params.id);
    await postRef.delete();
    res.send('Post cancellato');
  } catch (error) {
    console.error('Errore durante la cancellazione del post:', error);
    res.status(500).send('Errore durante la cancellazione del post');
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});