// src/api/firebaseClient.js ------------------------------------------------
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// ------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// transparent helper for building query results
async function docsToArray(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const firebase = {
  auth,
  db,
  storage,
};

export const authApi = {
  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),
  me: async () => {
    const u = auth.currentUser;
    if (!u) return null;
    const userDoc = await getDoc(doc(db, "users", u.uid));
    return userDoc.exists() ? { id: u.uid, ...userDoc.data() } : null;
  },
  logout: () => signOut(auth),
  login: (email, password) => signInWithEmailAndPassword(auth, email, password),
  register: async (email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), { email, role: "user" });
    return user;
  },
  // or send a link, etc.
};

export const usersApi = {
  list: async () => {
    const q = query(collection(db, "users"));
    return docsToArray(await getDocs(q));
  },
  update: (id, changes) => updateDoc(doc(db, "users", id), changes),
  inviteUser: async (email, role = "admin") => {
    // simple invitation pattern: write to an 'invitations' collection
    // and trigger a Cloud Function / external mailer to send the email.
    // for now, just create the doc and rely on you or a cron job to notify.
    await addDoc(collection(db, "invitations"), { email, role, created: Date.now() });
  },
};

export const entriesApi = {
  list: async (sort = "-created_date", lim = 200) => {
    let q = collection(db, "entries");
    if (sort) {
      const [field, dir] = sort.startsWith("-")
        ? [sort.slice(1), "desc"]
        : [sort, "asc"];
      q = query(q, orderBy(field, dir));
    }
    if (lim) q = query(q, limit(lim));
    return docsToArray(await getDocs(q));
  },
  filter: async (filters = {}, sort = "-created_date") => {
    let q = collection(db, "entries");
    for (const [k, v] of Object.entries(filters)) {
      q = query(q, where(k, "==", v));
    }
    if (sort) {
      const [field, dir] = sort.startsWith("-")
        ? [sort.slice(1), "desc"]
        : [sort, "asc"];
      q = query(q, orderBy(field, dir));
    }
    return docsToArray(await getDocs(q));
  },
  create: (data) => addDoc(collection(db, "entries"), data),
  update: (id, changes) => updateDoc(doc(db, "entries", id), changes),
  delete: (id) => deleteDoc(doc(db, "entries", id)),
};

export const bookmarkApi = {
  filter: async (filters = {}) => {
    let q = collection(db, "bookmarks");
    for (const [k, v] of Object.entries(filters)) {
      q = query(q, where(k, "==", v));
    }
    return docsToArray(await getDocs(q));
  },
  create: (data) => addDoc(collection(db, "bookmarks"), data),
  delete: (id) => deleteDoc(doc(db, "bookmarks", id)),
};

export const uploadFile = async (file) => {
  const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
  const snap = await uploadBytesResumable(storageRef, file);
  return getDownloadURL(snap.ref);
};

// keep the old shape so minimal frontend changes
export const base44 = {
  auth: authApi,
  entities: {
    User: usersApi,
    TeamEntry: entriesApi,
    Bookmark: bookmarkApi,
  },
  users: usersApi,
  integrations: {
    Core: {
      UploadFile: async ({ file }) => ({ file_url: await uploadFile(file) }),
    },
  },
};