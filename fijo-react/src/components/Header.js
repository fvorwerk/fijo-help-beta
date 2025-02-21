import React from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthProvider';
import Breadcrumbs from './Breadcrumbs';
import { useLocation } from 'react-router-dom';
import { auth } from '../firebase';

function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = location.pathname.split('/').pop() || 'Dashboard';
  if (!user) return <p>Loading...</p>;  // Prevents undefined user issues


  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex flex-col shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">FiJo Help</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <span className="text-sm bg-white text-blue-600 px-3 py-1 rounded shadow-md">
              Logged in as: <strong>{user.name || user.email}</strong>
            </span>
          ) : (
            <span className="text-sm bg-white text-blue-600 px-3 py-1 rounded shadow-md">Loading...</span>
          )}
          <button 
            onClick={handleLogout} 
            className="text-sm bg-red-500 px-3 py-1 text-white rounded shadow hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mt-2">
        <Breadcrumbs />
      </div>
    </header>
  );
}

export default Header;
