// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js'

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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const getStartedBtnLarge = document.getElementById('getStartedBtnLarge');
const signInBtn = document.getElementById('signInBtn');
const getStartedBtnSmall = document.getElementById('getStartedBtnSmall');

getStartedBtnLarge.onclick = () => signInWithPopup(auth, provider)

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(user);
        const uid = user.uid;
    } else {
        console.log('signed out');
    }
});