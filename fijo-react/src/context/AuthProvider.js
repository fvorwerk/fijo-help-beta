import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // Store all users for admins
  const [userCredits, setUserCredits] = useState(0); // Store available credits

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = { uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() };

            // ✅ Store user data globally
            setTimeout(() => setUser(userData), 0);
            
            // ✅ Fetch and set user credits
            setTimeout(() => setUserCredits(userDoc.data().credits || 0), 0);

            // ✅ If the user is an admin, fetch all users
            if (userData.role === 'admin') {
              const userQuery = query(collection(db, 'users'));
              const userSnapshot = await getDocs(userQuery);
              setTimeout(() => setUsers(userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), 0);
            }
          } else {
            console.warn("User document not found in Firestore.");
            setTimeout(() => setUser(null), 0);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setTimeout(() => setUser(null), 0);
        }
      } else {
        setTimeout(() => setUser(null), 0);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Function to manually refresh credits when needed
  const refreshUserCredits = async () => {
    if (user?.uid) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setTimeout(() => setUserCredits(userDoc.data().credits || 0), 0);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, userCredits, refreshUserCredits, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
