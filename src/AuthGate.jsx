import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LoaderCircle } from "lucide-react";
import { auth } from "./firebase.js";
import Login from "./Login.jsx";
import App from "./App.jsx";

// Shows the login page until the user is signed in, then shows the app.
export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [, setTick] = useState(0); // used to re-render after the profile name is saved

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  if (!ready) {
    return (
      <div className="auth-loading">
        <LoaderCircle className="spin" size={28} />
      </div>
    );
  }

  if (!user) {
    return <Login onProfileUpdated={() => setTick((n) => n + 1)} />;
  }

  return <App user={user} onLogout={() => signOut(auth)} />;
}
