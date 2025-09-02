import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js';
export { httpsCallable, connectFunctionsEmulator } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js';
export { onAuthStateChanged, signOut, signInWithPopup } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
export { collection, doc, addDoc, updateDoc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBXHfzw5VPOumy-y69luQPwOCo2opnAJ3Q",
    authDomain: "megablunder-masters.firebaseapp.com",
    projectId: "megablunder-masters",
    storageBucket: "megablunder-masters.firebasestorage.app",
    messagingSenderId: "634759769094",
    appId: "1:634759769094:web:a26ab05de78391e0c9a787",
    measurementId: "G-R0LKMXKGTX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const functions = getFunctions(app);