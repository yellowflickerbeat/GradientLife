// Import Firestore functions
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxI0AYkPRZdxTVUVON9rJMH0fsCMnDVsw",
  authDomain: "gradientlife-68d90.firebaseapp.com",
  projectId: "gradientlife-68d90",
  storageBucket: "gradientlife-68d90.firebasestorage.app",
  messagingSenderId: "322035152700",
  appId: "1:322035152700:web:a67f9cbbdc1914e4d61039",
  measurementId: "G-NGHM6HGRJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore initialized

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

  console.log("User data saved to Firestore:", user);
}

// Google Sign-In
const googleLoginButton = document.getElementById("googleLoginButton");
googleLoginButton.addEventListener("click", () => {
  console.log("Google Login button clicked");
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      saveUserData(user); // Save user to Firestore
      alert(`Welcome, ${user.displayName}!`);
      window.location.href = "index2.html"; // Redirect after login
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      alert("Failed to sign in with Google.");
    });
});

// Guest Login (Anonymous)
const guestLoginButton = document.getElementById("guestLoginButton");
guestLoginButton.addEventListener("click", () => {
  console.log("Guest Login button clicked");
  signInAnonymously(auth)
    .then((result) => {
      const user = result.user;
      saveUserData(user); // Save guest user to Firestore
      alert("Signed in as a guest!");
    })
    .catch((error) => {
      console.error("Guest sign-in error:", error);
      alert("Failed to sign in as a guest.");
    });
});

// Listen for auth state changes (useful for debugging)
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User signed in:", user.uid);
  } else {
    console.log("No user signed in");
  }
});
