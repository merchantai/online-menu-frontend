// api.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { ref, deleteObject, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);

// ---- CONFIG ----
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_PROJECT_ID.appspot.com",
  messagingSenderId: "FIREBASE_SENDER_ID",
  appId: "FIREBASE_APP_ID"
};

// ---- INIT ----
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null; // store signed-in user
let hotelData = null; // store hotel info after fetching

// ---- AUTH ----
export async function login() {
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
  console.log("✅ Logged in:", currentUser.email);
  return currentUser;
}

export async function logout() {
  await signOut(auth);
  currentUser = null;
  console.log("👋 Logged out");
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

// ---- HOTEL + MENU ----
export async function loadHotel(hotelId) {
  const hotelRef = doc(db, "hotels", hotelId);
  const snap = await getDoc(hotelRef);

  if (!snap.exists()) throw new Error("Hotel not found");
  hotelData = snap.data();

  return hotelData;
}

export function isAdmin() {
  if (!currentUser || !hotelData) return false;
  return currentUser.email === hotelData.ownerEmail;
}

// ---- MENU CRUD ----
export async function getMenuItems(hotelId) {
  const menuRef = collection(db, "hotels", hotelId, "menu");
  const snap = await getDocs(menuRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function uploadMenuItemImage(hotelId, file) {
  if (!file) throw new Error("No file provided");

  const imageRef = ref(storage, `hotels/${hotelId}/menu/${file.name}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}

export async function addMenuItem(hotelId, item, file) {
  if (!isAdmin()) throw new Error("Unauthorized");
  const menuRef = collection(db, "hotels", hotelId, "menu");
  if (file) {
    const imageUrl = await uploadMenuItemImage(hotelId, file);
    item.image = imageUrl; // Add image URL to item object
  }
  const newDoc = await addDoc(menuRef, item);
  return { id: newDoc.id, ...item };
}

export async function updateMenuItem(hotelId, itemId, updates) {
  if (!isAdmin()) throw new Error("Unauthorized");
  const itemRef = doc(db, "hotels", hotelId, "menu", itemId);
  await updateDoc(itemRef, updates);
  return true;
}

export async function deleteMenuItem(hotelId, itemId) {
  if (!isAdmin()) throw new Error("Unauthorized");

  const itemRef = doc(db, "hotels", hotelId, "menu", itemId);

  // Get the document first to retrieve the image URL
  const snapshot = await getDoc(itemRef);
  if (!snapshot.exists()) {
    throw new Error("Menu item not found");
  }

  const itemData = snapshot.data();

  // Delete Firestore document
  await deleteDoc(itemRef);

  // Delete image from storage if present
  if (itemData.image) {
    try {
      const imageRef = ref(storage, itemData.image); // image field contains the full URL
      await deleteObject(imageRef);
    } catch (error) {
      console.warn("Failed to delete image from storage:", error);
    }
  }

  return true;
}