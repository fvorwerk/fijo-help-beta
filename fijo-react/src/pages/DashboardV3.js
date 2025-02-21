import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthProvider';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Footer from '../components/Footer';
import Home from './Home';
import GenerateCertificate from './GenerateCertificate';
import ManageLessons from './ManageLessons';
import AdminUserManagement from './AdminUserManagement';
import AdminCertifierManagement from './AdminCertifierManagement';
import AdminLocationManagement from './AdminLocationManagement';
import { FaBars, FaChevronDown, FaSignOutAlt, FaUser, FaFileAlt, FaUsers, FaCogs, FaChalkboardTeacher } from 'react-icons/fa';
import { AiOutlineSafetyCertificate } from 'react-icons/ai';
import { FaLocationDot } from 'react-icons/fa6';
import { FiMoon, FiSun } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

function DashboardV3() {
    const { user, login } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [credits, setCredits] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/';
    };

    // Fetch user credits from Firestore
    const fetchUserCredits = useCallback(async () => {
        if (!user) return;
        try {
            const userQuery = query(collection(db, 'users'), where("email", "==", user.email));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
                setCredits(userSnapshot.docs[0].data().credits || 0);
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    }, [user]);

    useEffect(() => {
        fetchUserCredits();
    }, [fetchUserCredits]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar sidebarOpen={sidebarOpen} user={user} credits={credits} />

            {/* Main Content */}
            <div className={`flex flex-col flex-grow transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Top Navigation Bar */}
                <nav className="fixed top-0 left-0 w-full bg-blue-900 text-white border-b border-blue-700 p-4 flex items-center justify-between z-50">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white focus:outline-none hidden md:block">
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
                        <Route path="manage-lessons" element={<ManageLessons />} />
                        <Route path="manage-users" element={<AdminUserManagement />} />
                        <Route path="manage-certifiers" element={<AdminCertifierManagement />} />
                        <Route path="manage-locations" element={<AdminLocationManagement />} />
                    </Routes>
                </main>

                {/* Footer */}
                <Footer />
            </div>

            {/* Bottom Navigation Bar for Tablets and Mobile */}
            <nav className="fixed bottom-0 left-0 w-full bg-blue-900 text-white border-t border-blue-700 p-4 flex justify-around md:hidden lg:hidden">
                <NavLink to="/dashboard3/home" className="flex flex-col items-center">
                    <FaUser size={20} />
                    <span className="text-xs">Dashboard</span>
                </NavLink>
                <NavLink to="/dashboard3/generate" className="flex flex-col items-center">
                    <FaFileAlt size={20} />
                    <span className="text-xs">Generate</span>
                </NavLink>
                {user?.role === 'admin' && (
                    <>
                        <NavLink to="/dashboard3/manage-lessons" className="flex flex-col items-center">
                            <FaChalkboardTeacher size={20} />
                            <span className="text-xs">Lessons</span>
                        </NavLink>
                        <NavLink to="/dashboard3/manage-users" className="flex flex-col items-center">
                            <FaUsers size={20} />
                            <span className="text-xs">Users</span>
                        </NavLink>
                        <NavLink to="/dashboard3/manage-certifiers" className="flex flex-col items-center">
                            <AiOutlineSafetyCertificate size={20} />
                            <span className="text-xs">Certifiers</span>
                        </NavLink>
                        <NavLink to="/dashboard3/manage-locations" className="flex flex-col items-center">
                            <FaLocationDot size={20} />
                            <span className="text-xs">Locations</span>
                        </NavLink>
                    </>
                )}
            </nav>
        </div>
    );
}

export default DashboardV3;