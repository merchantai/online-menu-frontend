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
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { ref, deleteObject, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, logEvent } from "firebase/analytics";

// ---- CONFIG ----
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID 
};

// ---- INIT ----
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

let currentUser = null; 
let hotelData = null; 

export { auth, db, storage, provider, analytics }; 

/**
 * Log a custom analytics event
 */
export function logAnalyticsEvent(name, params = {}) {
  logEvent(analytics, name, params);
}

// ---- AUTH ----
export async function login() {
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
  return currentUser;
}

export async function logout() {
  await signOut(auth);
  currentUser = null;
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

// ---- HOTEL + MENU ----
export async function getAllHotels() {
  const hotelsRef = collection(db, "hotels");
  const snap = await getDocs(hotelsRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function loadHotel(hotelId) {
  const hotelRef = doc(db, "hotels", hotelId);
  const snap = await getDoc(hotelRef);

  if (!snap.exists()) throw new Error("Hotel not found");
  hotelData = { id: snap.id, ...snap.data() };
  return hotelData;
}

export function isPlatformAdmin() {
  if (!currentUser) return false;
  const adminList = import.meta.env.VITE_ADMIN_LIST || '';
  const admins = adminList.split(',').map(e => e.trim().toLowerCase());
  const isPlatform = admins.includes(currentUser.email.toLowerCase());
  return isPlatform;
}

export function isAdmin() {
  if (!currentUser) return false;
  if (isPlatformAdmin()) return true;
  if (!hotelData) return false;
  
  if (Array.isArray(hotelData.ownerEmail)) {
      return hotelData.ownerEmail.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());
  }
  return currentUser.email.toLowerCase() === (hotelData.ownerEmail || '').toLowerCase();
}

// ---- HOTEL CRUD (PLATFORM ADMIN) ----

export async function uploadHotelImage(hotelId, file) {
  if (!file) throw new Error("No file provided");
  const imageRef = ref(storage, `hotels/${hotelId}/branding/${file.name}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}

export async function addHotel(hotel, file, customId = null) {
  if (customId) {
    const hotelRef = doc(db, "hotels", customId);
    // Check if ID already exists
    const existing = await getDoc(hotelRef);
    if (existing.exists()) throw new Error("Shop ID already taken. Please choose another.");
    
    let finalHotel = { ...hotel };
    if (file) {
      const imageUrl = await uploadHotelImage(customId, file);
      finalHotel.image = imageUrl;
    }
    await setDoc(hotelRef, finalHotel);
    return { id: customId, ...finalHotel };
  }

  const hotelsRef = collection(db, "hotels");
  if (file) {
    const newHotelDoc = await addDoc(hotelsRef, hotel);
    const imageUrl = await uploadHotelImage(newHotelDoc.id, file);
    await updateDoc(newHotelDoc, { image: imageUrl });
    return { id: newHotelDoc.id, ...hotel, image: imageUrl };
  }
  const newDoc = await addDoc(hotelsRef, hotel);
  return { id: newDoc.id, ...hotel };
}

export async function checkShopIdAvailable(shopId) {
  if (!shopId) return false;
  const hotelRef = doc(db, "hotels", shopId);
  const snap = await getDoc(hotelRef);
  return !snap.exists();
}

export async function updateHotel(hotelId, updates, file) {
  const hotelRef = doc(db, "hotels", hotelId);
  if (file) {
    const imageUrl = await uploadHotelImage(hotelId, file);
    updates.image = imageUrl;
  }
  await updateDoc(hotelRef, updates);
  return true;
}

export async function deleteHotel(hotelId) {
  const hotelRef = doc(db, "hotels", hotelId);
  
  // Optionally delete menu items first if needed by business logic
  // For now just delete the shop
  await deleteDoc(hotelRef);
  return true;
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

export async function uploadOfferImage(hotelId, file) {
  if (!file) throw new Error("No file provided");
  // Timestamp to avoid name collisions/caching issues
  const timestamp = Date.now();
  const imageRef = ref(storage, `hotels/${hotelId}/offers/${timestamp}_${file.name}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}

export async function addMenuItem(hotelId, item, file) {
  const menuRef = collection(db, "hotels", hotelId, "menu");
  if (file) {
    const imageUrl = await uploadMenuItemImage(hotelId, file);
    item.image = imageUrl; 
  }
  const newDoc = await addDoc(menuRef, item);
  return { id: newDoc.id, ...item };
}

export async function updateMenuItem(hotelId, itemId, updates, file) {
  if (file) {
    const imageUrl = await uploadMenuItemImage(hotelId, file);
    updates.image = imageUrl;
  }

  const itemRef = doc(db, "hotels", hotelId, "menu", itemId);
  await updateDoc(itemRef, updates);
  return true;
}

export async function deleteMenuItem(hotelId, itemId) {
  const itemRef = doc(db, "hotels", hotelId, "menu", itemId);

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
      const imageRef = ref(storage, itemData.image); 
      await deleteObject(imageRef);
    } catch (error) {
      console.warn("Failed to delete image from storage:", error);
    }
  }

  return true;
}