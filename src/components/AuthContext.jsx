// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            // User exists in Firestore
            const userData = userSnap.data();
            setCredits(userData.credits || 0);
          } else {
            // First time user - create document with default credits
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              credits: 50, // Make sure this is included
              createdAt: new Date()
            });
            setCredits(50);
          }
          
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setCredits(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Function to refresh credits manually
  const refreshCredits = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCredits(userSnap.data().credits || 0);
        }
      } catch (error) {
        console.error("Error refreshing credits:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, credits, loading, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);