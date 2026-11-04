const { admin, getDb } = require('../firebase/admin');

async function ensureUserProfile(decodedToken) {
  const db = getDb();
  const userRef = db.collection('users').doc(decodedToken.uid);
  const snapshot = await userRef.get();

  const defaultProfile = {
    name: decodedToken.name || decodedToken.email?.split('@')[0] || 'FitMon User',
    email: decodedToken.email || '',
    role: 'trainee',
    goals: [],
    preferences: {
      // Which arm live sessions track. 'auto' follows whichever arm the camera sees best.
      trackedArm: 'auto',
      units: 'metric',
    },
  };

  if (!snapshot.exists) {
    await userRef.set({
      ...defaultProfile,
      photoURL: decodedToken.picture || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.set(
      {
        // A name saved in the profile editor wins over the Google account name.
        name: snapshot.data().name || decodedToken.name || defaultProfile.name,
        email: decodedToken.email || snapshot.data().email || defaultProfile.email,
        photoURL: decodedToken.picture || snapshot.data().photoURL || '',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  const refreshed = await userRef.get();
  return {
    uid: decodedToken.uid,
    ...refreshed.data(),
  };
}

// `updates` uses Firestore field paths, e.g. { name, goal, 'preferences.trackedArm': 'left' }.
async function updateUserProfile(uid, updates) {
  const userRef = getDb().collection('users').doc(uid);
  await userRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const refreshed = await userRef.get();
  return {
    uid,
    ...refreshed.data(),
  };
}

module.exports = { ensureUserProfile, updateUserProfile };
