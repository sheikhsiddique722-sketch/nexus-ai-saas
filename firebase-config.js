// ═══════════════════════════════════════════════════════════
//  NEXUS — Firebase Configuration
//  Shared by all pages: signup, signin, dashboard
// ═══════════════════════════════════════════════════════════
//
//  SETUP STEPS (one time — takes ~5 minutes):
//
//  1. Go to  https://console.firebase.google.com
//  2. Click "Add project" → give it any name → Continue
//  3. Disable Google Analytics (optional) → Create project
//  4. Click the WEB icon </>  → Register app → name it "Nexus"
//  5. Copy the firebaseConfig object below and REPLACE the values
//  6. In left sidebar → Build → Authentication → Get started
//     → Sign-in method tab:
//       ✅ Enable "Email/Password"
//       ✅ Enable "Google" (add your support email)
//  7. In left sidebar → Build → Firestore Database → Create database
//     → Start in TEST mode → Choose any region → Done
//  8. Done! Open signup.html with VS Code Live Server
//
//  IMPORTANT: Files must be opened via Live Server (not file://)
//  Install "Live Server" extension in VS Code → right-click
//  index.html → "Open with Live Server"
// ═══════════════════════════════════════════════════════════

import { initializeApp }         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }          from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ▼▼▼  REPLACE THESE WITH YOUR OWN VALUES FROM FIREBASE CONSOLE  ▼▼▼
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ▲▲▲  REPLACE ABOVE  ▲▲▲

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Helpers ──────────────────────────────────────────────────
export function makeApiKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "nx_live_";
  for (let i = 0; i < 40; i++)
    key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":    "An account with this email already exists.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password must be at least 8 characters.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/too-many-requests":       "Too many attempts. Please try again later.",
    "auth/network-request-failed":  "Network error. Check your connection.",
    "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
    "auth/cancelled-popup-request": "Google sign-in was cancelled.",
    "auth/invalid-credential":      "Incorrect email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
