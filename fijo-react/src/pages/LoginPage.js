import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Import icons for password visibility

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both fields.'); // Prevents empty submissions
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence); // Enables persistence if "Remember Me" is checked
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Example: Redirect based on role (modify as needed)
        navigate(userData.role === 'admin' ? '/dashboard' : '/dashboard');
      } else {
        setError('User data not found. Please contact support.');
      }
    } catch (error) {
      setError(error.message); // Displays Firebase-specific error messages
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">Login</h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        <div className="relative w-full mb-3">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-blue-400 transition"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative w-full mb-3">
          <input 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Password" 
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-blue-400 transition"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff className="text-gray-500" /> : <FiEye className="text-gray-500" />}
          </button>
        </div>
        <div className="flex items-center mb-3">
          <input 
            type="checkbox" 
            id="rememberMe" 
            className="mr-2"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="text-gray-700 dark:text-gray-300">Remember Me</label>
        </div>
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded transition ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-center mt-3">
          <a href="/forgot-password" className="text-blue-500 text-sm hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
