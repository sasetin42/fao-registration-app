import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  orderBy,
  limit,
  documentId
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCQGKtLCvaegq1cu20BzMvDSA6w06iBsZk",
  authDomain: "fao-registration.firebaseapp.com",
  projectId: "fao-registration",
  storageBucket: "fao-registration.firebasestorage.app",
  messagingSenderId: "112354032727",
  appId: "1:112354032727:web:8ac4f5ea23360e0ab73712",
  measurementId: "G-PX82CE9GET"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "fao-online");
export const storage = getStorage(app, "gs://fao-registration.firebasestorage.app");
export const auth = getAuth(app);

// Helper to convert Firestore document to a plain object containing its id
const convertDoc = (docSnap) => {
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

// ── INSERT ───────────────────────────────────────────────────
export async function insert(collectionName, data) {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  // Return an array containing the written data with its generated id property
  return [{ id: docRef.id, ...data }];
}

// ── SELECT ───────────────────────────────────────────────────
export async function select(collectionName, match = {}, selectCols = '*', opts = {}) {
  const colRef = collection(db, collectionName);
  let constraints = [];

  for (const [k, v] of Object.entries(match)) {
    if (k === 'id') {
      constraints.push(where(documentId(), "==", v));
    } else {
      constraints.push(where(k, "==", v));
    }
  }

  if (opts.order) {
    // order format expected: e.g. "created_at.desc"
    const [field, direction] = opts.order.split('.');
    constraints.push(orderBy(field, direction || 'asc'));
  }

  if (opts.limit) {
    constraints.push(limit(Number(opts.limit)));
  }

  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((docSnap) => {
    results.push({ id: docSnap.id, ...docSnap.data() });
  });
  return results;
}

// ── UPDATE (single or multiple match) ────────────────────────
export async function update(collectionName, data, match) {
  // First select the matching documents to update
  const matchingDocs = await select(collectionName, match);
  const updatedDocs = [];
  for (const docInfo of matchingDocs) {
    const docRef = doc(db, collectionName, docInfo.id);
    await updateDoc(docRef, data);
    updatedDocs.push({ ...docInfo, ...data });
  }
  return updatedDocs;
}

// ── DELETE (single or multiple match) ────────────────────────
export async function remove(collectionName, match) {
  const matchingDocs = await select(collectionName, match);
  for (const docInfo of matchingDocs) {
    const docRef = doc(db, collectionName, docInfo.id);
    await deleteDoc(docRef);
  }
  return true;
}

// ── BATCH UPDATE (keyCol IN values list) ─────────────────────
export async function updateBatch(collectionName, data, keyCol, values) {
  if (!values || !values.length) return [];
  const colRef = collection(db, collectionName);
  const updatedDocs = [];
  const batch = writeBatch(db);

  // Firestore doesn't support an direct 'in' update easily unless we query or reference documents.
  // We can query matches where keyCol is in the list or loop. Since values list can be strings/numbers,
  // let's retrieve documents matching the criteria.
  // Note: Firestore where 'in' supports maximum 30 values in a single query.
  // To be robust, let's query all docs or do it by chunking/matching.
  const querySnapshot = await getDocs(colRef);
  querySnapshot.forEach((docSnap) => {
    const docData = docSnap.data();
    const docVal = docData[keyCol];
    // Compare stringified versions of keys to prevent PG number vs Firestore string ID mismatch
    const isMatched = values.some(val => String(val) === String(docVal) || String(val) === String(docSnap.id));
    if (isMatched) {
      const docRef = doc(db, collectionName, docSnap.id);
      batch.update(docRef, data);
      updatedDocs.push({ id: docSnap.id, ...docData, ...data });
    }
  });

  await batch.commit();
  return updatedDocs;
}

// ── BATCH DELETE (keyCol IN values list) ─────────────────────
export async function removeBatch(collectionName, keyCol, values) {
  if (!values || !values.length) return true;
  const colRef = collection(db, collectionName);
  const batch = writeBatch(db);
  let hasDeletes = false;

  const querySnapshot = await getDocs(colRef);
  querySnapshot.forEach((docSnap) => {
    const docData = docSnap.data();
    const docVal = docData[keyCol];
    const isMatched = values.some(val => String(val) === String(docVal) || String(val) === String(docSnap.id));
    if (isMatched) {
      const docRef = doc(db, collectionName, docSnap.id);
      batch.delete(docRef);
      hasDeletes = true;
    }
  });

  if (hasDeletes) {
    await batch.commit();
  }
  return true;
}

// ── SAVE ZOOM DETAILS ────────────────────────────────────────
export async function saveZoomDetails(userId, joinUrl) {
  try {
    await insert('zoom_registrations', {
      user_id: String(userId),
      join_url: joinUrl,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Firestore saveZoomDetails error:', err.message);
  }
}
