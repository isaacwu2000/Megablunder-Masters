import { onAuthStateChanged, signInWithPopup } from './firebaseConfig.js';
import { app, auth, db, signOut, provider } from './firebaseConfig.js';

const getStartedBtnLarge = document.getElementById('getStartedBtnLarge');
const signInBtn = document.getElementById('signInBtn');
let signOutBtn;

async function loadPage(page) {
    const result = await fetch(page);
    const html = await result.text();
    console.log('html' + html);
    document.body.innerHTML = html;
}

function initApp() {
    signOutBtn = document.getElementById('signOutBtn');
    document.querySelector("link[rel=stylesheet][href='styles/index.css']").href = "styles/app.css";
    signOutBtn.onclick = async () => {
        await signOut(auth);
        await loadPage('index.html');
        location.reload();
    }
}

getStartedBtnLarge.onclick = () => signInWithPopup(auth, provider);
signInBtn.onclick = () => signInWithPopup(auth, provider);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log(user);
        const uid = user.uid;
        await loadPage('app.html');
        initApp();
    } else {
        console.log('signed out');
        document.querySelector("link[rel=stylesheet][href='styles/app.css']").href = "styles/index.css";
        getStartedBtnLarge.onclick = () => signInWithPopup(auth, provider);
        signInBtn.onclick = () => signInWithPopup(auth, provider);
    }
});