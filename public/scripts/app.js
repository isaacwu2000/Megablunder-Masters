import { getAdditionalUserInfo, signOut, onAuthStateChanged, signInWithPopup } from './firebaseConfig.js';
import { app, auth, db, provider } from './firebaseConfig.js';
import { collection, doc, updateDoc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from './firebaseConfig.js';

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

function keepOpacity(btn) {
    btn.style.opacity = "1"; // Preventing opcaity change on hover
}

function initApp(problemDoc, userDoc) {
    signOutBtn = document.getElementById('signOutBtn');
    topicSelector = document.getElementById('topicSelector');
    answerChoices = document.getElementById('answerChoices');
    sentence = document.getElementById('sentence');
    feedback = document.getElementById('feedback');
    fullSolution = document.getElementById('fullSolution');
    continueBtn = document.getElementById('continueBtn');
    
    let category;

    try {
        document.querySelector("link[rel=stylesheet][href='styles/index.css']").href = "styles/app.css";
    } catch (TypeError) {
        console.log('switiching topic');
    }
    
    answerChoices.onsubmit = async (event) => {
        event.preventDefault();
        // todo: update user's attemptedProblems collection

        // Prevent the User from submitting again
        const answerBtns = document.getElementsByClassName('answerChoice');
        for (const btn of answerBtns) {
            btn.disabled = true;
            btn.style.color = '#000000';
            btn.addEventListener("mouseover", keepOpacity(btn));
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

        continueBtn.onclick = async () => {
            // Getting the next problem when the continueBtn is clicked
            if (category) {
                problemDoc = await getProblem(userDoc, category);
            } else {
                problemDoc = await getProblem(userDoc);
            }
                
            sentence.innerHTML = await problemDoc.data().problemStatement;

            // Hiding the solution, feedback, and continueBtn
            solution.hidden = true;
            continueBtn.hidden = true;
            feedback.innerHTML = '';
            fullSolution.innerHTML = '';

            // Allow the User to submit again
            const answerBtns = document.getElementsByClassName('answerChoice');
            for (const btn of answerBtns) {
                btn.disabled = false;
                btn.style.backgroundColor = 'unset';
                btn.removeEventListener('mouseover', keepOpacity(btn));
            };
        }
    }
    
    topicSelector.onchange = async (event) => {
        event.preventDefault();
        category = event.target.value;
        console.log(category);

        // Updating the problem to be of that category
        problemDoc = await getProblem(userDoc, category);
        sentence.innerHTML = await problemDoc.data().problemStatement;

        // Hiding the solution, feedback, and continueBtn
        solution.hidden = true;
        continueBtn.hidden = true;
        feedback.innerHTML = '';
        fullSolution.innerHTML = '';
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
        let problemDoc = await getProblem(userDoc);

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
async function getProblem(userDoc, category) {
    let userElo = await userDoc.data().elo;
    let q;
    // Querying for the hardest problem with elo between 32–65 less than the user's
    // so that the user has a 75%–90% chance of doing the problem correctly
    if (category) {
        console.log('test');
        q = await getDocs(await query(collection(db, 'problems'), 
            where('category', '==', category),
            where('elo', '>=', userElo-65),
            where('elo', '<=', userElo-32),
            orderBy('elo', 'desc'), 
            limit(1)
        ));
        if (q.empty) {
            console.log('test');
            q = await getDocs(await query(collection(db, 'problems'),
                where('category', '==', category),
                where('elo', '>=', userElo-65),
                limit(1)
            ));
            if (q.empty) {
                console.log('test');
                q = await getDocs(await query(
                    collection(db, 'problems'),
                    where('category', '==', category), 
                    limit(1)
                ));
                if (q.empty) {
                    console.log('test');
                    q = await getDocs(await query(
                        collection(db, 'problems'),
                        limit(1)
                    ));
                };
            };
        }
    } else {
        console.log('test');
        q = await getDocs(await query(collection(db, 'problems'),
            where('elo', '>=', userElo-65),
            where('elo', '<=', userElo-32),
            orderBy('elo', 'desc'), 
            limit(1)
        ));
        if (q.empty) {
            console.log('test');
            q = await getDocs(await query(collection(db, 'problems'),
                where('elo', '>=', userElo-65),
                limit(1)
            ));
            if (q.empty) {
                console.log('test');
                q = await getDocs(await query(
                    collection(db, 'problems'), 
                    limit(1)
                ));
            };
        }
    }
    
    const optimalDoc = q.docs[0];
    console.log("Optimal: " + optimalDoc.id, " => ", optimalDoc.data());
    return optimalDoc;
}

async function updateElos(userDoc, problemDoc, userAnswer) {
    let userElo = userDoc.data().elo;
    let problemElo = problemDoc.data().elo;
    console.log('original elo: ' + 'userElo: ' + userElo + 'problemElo: ' + problemElo);
    const probabilityUserLose = 1 / (1 + Math.pow(Math.E, -1 * (userElo - problemElo) / 30));
    const k = 20;
    const userWin = (userAnswer == problemDoc.data().answer);
    if (userWin) {
        userElo += k * probabilityUserLose;
        problemElo -= k * probabilityUserLose;
    } else {
        userElo -= k * (1 - probabilityUserLose);
        problemElo += k * (1 - probabilityUserLose);
    }
    await updateDoc(userDoc.ref, {
        elo: userElo
    });
    await updateDoc(problemDoc.ref, {
        elo: problemElo
    });
    console.log('elos updated: ' + 'userElo: ' + userElo + 'problemElo: ' + problemElo);
    return userWin;
}



// todo: Change topic