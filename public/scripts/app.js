import { getAdditionalUserInfo, signOut, onAuthStateChanged, signInWithPopup } from './firebaseConfig.js';
import { app, auth, db, provider } from './firebaseConfig.js';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from './firebaseConfig.js';

const getStartedBtnLarge = document.getElementById('getStartedBtnLarge');
const signInBtn = document.getElementById('signInBtn');

let signOutBtn;
let topicSelector;
let answerChoices;
let sentence;
let feedback;
let fullSolution;
let continueBtn;

// Manage user authentication and app loading
async function loadPage(page) {
    const result = await fetch(page);
    const html = await result.text();
    document.body.innerHTML = html;
}

function initApp(problemDoc, userDoc) {
    signOutBtn = document.getElementById('signOutBtn');
    topicSelector = document.getElementById('topicSelector');
    answerChoices = document.getElementById('answerChoices');
    sentence = document.getElementById('sentence');
    feedback = document.getElementById('feedback');
    fullSolution = document.getElementById('fullSolution');
    continueBtn = document.getElementById('continueBtn');

    document.querySelector("link[rel=stylesheet][href='styles/index.css']").href = "styles/app.css";
    
    answerChoices.onsubmit = async (event) => {
        event.preventDefault();
        // Prevent the User from submitting again
        const answerBtns = document.getElementsByClassName('answerChoice');
        for (const btn of answerBtns) {
            btn.disabled = true;
            btn.style.color = '#000000';
            btn.addEventListener("mouseover", () => {
                btn.style.opacity = "1"; // Preventing opcaity change on hover
            });
        };

        // Show solution, continueBtn, and feedback based on User response 
        const userCorrect = await updateElos(userDoc, problemDoc, event.submitter.value);
        if (userCorrect) { // Show color and text feedback
            event.submitter.style.backgroundColor = '#70e615';
            feedback.innerHTML = 'Correct!';
        } else {
            event.submitter.style.backgroundColor = '#ff5b24';
            feedback.innerHTML = 'Incorrect'
        }
        fullSolution.innerHTML = await problemDoc.data().solution;
        console.log(fullSolution.innerHTML);
        solution.hidden = false;
        continueBtn.hidden = false;
    }
    
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
        if (user.metadata.creationTime == user.metadata.lastSignInTime) {
            await setDoc(doc(db, 'users', uid), {
                email: user.email,
                displayName: user.displayName,
                elo: 300 // Todo: edit this baseline elo based on average
            });
        }
        await loadPage('app.html');
        const userDoc = await getDoc(doc(db, 'users', uid));
        let problemDoc = await getProblem(userDoc.data().elo);

        initApp(problemDoc, userDoc);
        sentence.innerHTML = await problemDoc.data().problemStatement;
        
    } else {
        console.log('signed out');
        document.querySelector("link[rel=stylesheet][href='styles/app.css']").href = "styles/index.css";
        getStartedBtnLarge.onclick = () => signInWithPopup(auth, provider);
        signInBtn.onclick = () => signInWithPopup(auth, provider);
    }
});

// Manage problems and elos
async function getProblem(userElo=300, category) {
    let q;
    // Querying for the hardest problem with elo between 32–65 less than the user's
    // so that the user has a 75%–90% chance of doing the problem correctly
    if (category) {
        q = await query(collection(db, 'problems'), 
            where('category', '==', category),
            where('elo', '>=', userElo-65),
            where('elo', '<=', userElo-32),
            orderBy('elo', 'desc'), 
            limit(1)
        );
    } else {
        q = await query(collection(db, 'problems'),
            where('elo', '>=', userElo-65),
            where('elo', '<=', userElo-32),
            orderBy('elo', 'desc'), 
            limit(1)
        );
    }
    if (q.empty) {
        q = await query(collection(db, 'problems'),
            where('elo', '>=', userElo-65),
            orderBy('elo', 'desc'), 
            limit(1)
        );
        if (q.empty) {q = await query(
            collection(db, 'problems'),
            orderBy('elo', 'desc'), 
            limit(1))
        };
    }

    const optimalDoc = (await getDocs(q)).docs[0];
    console.log("Optimal: " + optimalDoc.id, " => ", optimalDoc.data());
    return optimalDoc;
}

async function updateElos(userDoc, problemDoc, userAnswer) {
    let userElo = userDoc.data().elo;
    let problemElo = userDoc.data().elo;
    const probabilityUserLose = -1 / (1 + Math.pow(Math.E, -1 * (userElo - problemElo) / 30));
    const k = 20;
    const userWin = (userAnswer == problemDoc.data().answer);
    if (userWin) {
        userElo += k * probabilityUserLose;
        problemElo -= k * probabilityUserLose;
    } else {
        userElo -= k * (1 - probabilityUserLose);
        problemElo += k * (1 - probabilityUserLose);
    }
    console.log('elos NOT updated');
    // update firestore

    return userWin;
}



// todo: Change topic