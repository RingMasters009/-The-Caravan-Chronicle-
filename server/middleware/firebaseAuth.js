const admin = require('firebase-admin');

// You need to download your Firebase service account key from the Firebase Console
// and set the path in your environment variable or paste the JSON here for local dev.
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Middleware to verify Firebase ID token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Firebase token', error: err.message });
  }
}

module.exports = { verifyFirebaseToken };
