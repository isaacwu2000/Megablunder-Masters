// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBXHfzw5VPOumy-y69luQPwOCo2opnAJ3Q",
    authDomain: "megablunder-masters.firebaseapp.com",
    projectId: "megablunder-masters",
    storageBucket: "megablunder-masters.firebasestorage.app",
    messagingSenderId: "634759769094",
    appId: "1:634759769094:web:a26ab05de78391e0c9a787",
    measurementId: "G-R0LKMXKGTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);