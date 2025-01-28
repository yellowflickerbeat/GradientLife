import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxI0AYkPRZdxTVUVON9rJMH0fsCMnDVsw",
  authDomain: "gradientlife-68d90.firebaseapp.com",
  projectId: "gradientlife-68d90",
  storageBucket: "gradientlife-68d90.firebasestorage.app",
  messagingSenderId: "322035152700",
  appId: "1:322035152700:web:a67f9cbbdc1914e4d61039",
  measurementId: "G-NGHM6HGRJ9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Sign-In
const googleLoginButton = document.getElementById("googleLoginButton");
googleLoginButton.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Google signed-in user:", user);
      alert(`Welcome, ${user.displayName}! Redirecting to homepage...`);
      // Redirect to homepage
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      alert("Failed to sign in with Google.");
    });
});

// Guest Login
const guestLoginButton = document.getElementById("guestLoginButton");
guestLoginButton.addEventListener("click", () => {
  signInAnonymously(auth)
    .then(() => {
      alert("Signed in as a guest! Starting with fresh data...");
      console.log("Guest user signed in. Resetting state.");
      // Perform any necessary data reset for guest users
    })
    .catch((error) => {
      console.error("Guest sign-in error:", error);
      alert("Failed to sign in as a guest.");
    });
});
