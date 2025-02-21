import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

function PrivateRoute({ children, adminOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser(currentUser);
            setIsAdmin(userDoc.data().role === 'admin');
          }
        }
        setLoading(false);
      });
    };
    checkAuth();
  }, []);

  if (loading) return <div className="text-center p-5">Loading...</div>;

  if (!user) return <Navigate to="/" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return children;
}

export default PrivateRoute;
