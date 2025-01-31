// Import Firestore functions
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxI0AYkPRZdxTVUVON9rJMH0fsCMnDVsw",
  authDomain: "gradientlife-68d90.firebaseapp.com",
  projectId: "gradientlife-68d90",
  storageBucket: "gradientlife-68d90.appstore.app",
  messagingSenderId: "322035152700",
  appId: "1:322035152700:web:a67f9cbbdc1914e4d61039",
  measurementId: "G-NGHM6HGRJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authStatus = document.createElement('div');
const loadingSpinner = document.createElement('div');
let messageTimeout;

// Function to show status messages
function showMessage(type, message) {
  authStatus.textContent = message;
  authStatus.className = `auth-message ${type}`;
  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    authStatus.textContent = '';
    authStatus.className = 'auth-message';
  }, 5000);
}

// Function to save user data in Firestore
async function saveUserData(user) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    displayName: user.displayName || "Anonymous",
    email: user.email || null,
    photoURL: user.photoURL || null,
    createdAt: new Date(),
    uid: user.uid
  }, { merge: true });
}

// Google Sign-In
document.getElementById('googleLoginButton').addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      saveUserData(result.user);
      showMessage('success', `Welcome, ${result.user.displayName}!`);
      setTimeout(() => window.location.href = "index2.html", 1500);
    })
    .catch((error) => {
      showMessage('error', `Google sign-in failed: ${error.message}`);
    });
});

// Guest Login
document.getElementById('guestLoginButton').addEventListener('click', () => {
  signInAnonymously(auth)
    .then((result) => {
      saveUserData(result.user);
      showMessage('success', "Guest session started!");
      setTimeout(() => window.location.href = "index2.html", 1500);
    })
    .catch((error) => {
      showMessage('error', `Guest login failed: ${error.message}`);
    });
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Authenticated user:", user.uid);
  } else {
    console.log("No authenticated user");
  }
});

// Add styles dynamically
const style = document.createElement('style');
style.textContent = `
  .auth-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-family: Georgia, serif;
    z-index: 1000;
    opacity: 0;
    animation: fadeInOut 5s forwards;
  }
  
  .success {
    background: #d1fae5;
    color: #065f46;
    border: 2px solid #34d399;
  }
  
  .error {
    background: #fee2e2;
    color: #991b1b;
    border: 2px solid #f87171;
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; top: 0; }
    10% { opacity: 1; top: 20px; }
    90% { opacity: 1; top: 20px; }
    100% { opacity: 0; top: 0; }
  }
`;

document.head.appendChild(style);
document.body.appendChild(authStatus);