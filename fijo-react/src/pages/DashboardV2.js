import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthProvider';
import { auth } from '../firebase';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import GenerateCertificate from '../pages/GenerateCertificate';
import ManageUsers from '../pages/AdminUserManagement';
import { FaBars, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import Home from './Home';

function DashboardV2() {
    const { user, login } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/';
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

            {/* Main Content */}
            <div className={`flex flex-col flex-grow transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} md:ml-0`}>
                {/* Top Navigation Bar */}
                <nav className="fixed top-0 left-0 w-full bg-blue-900 text-white border-b border-blue-700 p-4 flex items-center justify-between z-50">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white focus:outline-none">
                            <FaBars size={20} />
                        </button>
                        <h1 className="text-xl font-bold">FiJo Help</h1>
                    </div>
                    <div className="relative">
                        {user ? (
                            <div>
                                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                                    <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="User" />
                                    <span>{user.name || user.email}</span>
                                    <FaChevronDown size={14} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2">
                                        <p className="px-4 py-2 text-sm font-semibold">{user.name || user.email}</p>
                                        <button onClick={handleLogout} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
                                            <FaSignOutAlt className="inline mr-2" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={login} className="text-sm bg-blue-700 px-3 py-1 text-white rounded shadow hover:bg-blue-600 transition">
                                Login
                            </button>
                        )}
                    </div>
                </nav>

                {/* Page Content */}
                <main className="flex-grow p-5 pt-20 overflow-auto">
                    <Routes>
                        <Route path="home" element={<Home />} />
                        <Route path="generate" element={<GenerateCertificate />} />
                        <Route path="manage-users" element={<ManageUsers />} />
                    </Routes>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}

export default DashboardV2;
