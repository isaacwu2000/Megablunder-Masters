import { signOut, onAuthStateChanged, signInWithPopup } from './firebaseConfig.js';
import { auth, db, provider, functions } from './firebaseConfig.js';
import { collection, doc, updateDoc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from './firebaseConfig.js';
import { httpsCallable, connectFunctionsEmulator } from './firebaseConfig.js';

// Get rid of this when in production
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

const getStartedBtnLarge = document.getElementById('getStartedBtnLarge');
const signInBtn = document.getElementById('signInBtn');

let signOutBtn;
let topicSelector;
let answerChoices;
let sentence;
let feedback;
let fullSolution;
let continueBtn;

// Manage problems and elos
const getProblem = httpsCallable(functions, 'get_problem');
const updateElos = httpsCallable(functions, 'update_elos');


// Manage app loading
async function loadPage(page) {
    const result = await fetch(page);
    const html = await result.text();
    document.body.innerHTML = html;
}

// Manage app
function initApp(problem) {
    signOutBtn = document.getElementById('signOutBtn');
    topicSelector = document.getElementById('topicSelector');
    answerChoices = document.getElementById('answerChoices');
    sentence = document.getElementById('sentence');
    feedback = document.getElementById('feedback');
    fullSolution = document.getElementById('fullSolution');
    continueBtn = document.getElementById('continueBtn');

    let category;

    // Setting the problem
    sentence.innerHTML = problem.problemStatement;

    // Update css
    try {document.querySelector("link[rel=stylesheet][href='styles/index.css']").href = "styles/app.css";} catch (TypeError) {}
    
    answerChoices.onsubmit = async (event) => {
        event.preventDefault();
        // Prevent the User from submitting again
        const answerBtns = document.getElementsByClassName('answerChoice');
        for (const btn of answerBtns) {
            btn.disabled = true;
            btn.style.color = '#000000';
            btn.addEventListener("mouseover", keepOpacity(btn));
        };

        // Show solution, continueBtn, and feedback based on user response 
        const correct = await updateElos({problemId: problem.id, userAnswer: event.submitter.value});
        if (correct.data.correct) { // Show color and text feedback
            event.submitter.style.backgroundColor = '#70e615';
            feedback.innerHTML = 'Correct!';
        } else {
            event.submitter.style.backgroundColor = '#ff5b24';
            feedback.innerHTML = 'Incorrect'
        }
        fullSolution.innerHTML = await problem.solution;
        solution.hidden = false;
        continueBtn.hidden = false;

        continueBtn.onclick = async () => {
            // Getting the next problem when the continueBtn is clicked
            if (category) {
                problem = (await getProblem({category: category})).data;
            } else {
                problem = (await getProblem({category: ''})).data;
            }
                
            sentence.innerHTML = await problem.problemStatement;

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
        if (category=='all') {
            category=='';
        }

        // Updating the problem to be of that category
        problem = await getProblem(category);
        sentence.innerHTML = problem.problemStatement;

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

// Manage auth and ensure sign in buttons function properly
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
                elo: 300 // Todo: edit this baseline elo based on average and move it to a cloud function
            });
        }
        await loadPage('app.html');

        let problem = await getProblem({category: ''});
        initApp(problem.data);
    } else {
        console.log('signed out');
        document.querySelector("link[rel=stylesheet][href='styles/app.css']").href = "styles/index.css";
        getStartedBtnLarge.onclick = () => signInWithPopup(auth, provider);
        signInBtn.onclick = () => signInWithPopup(auth, provider);
    }
});

// Prevent opcaity change on hover
function keepOpacity(btn) {
    btn.style.opacity = "1"; 
}