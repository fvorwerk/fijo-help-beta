import React, { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FaUser, FaFileAlt, FaUsers, FaCogs, FaChalkboardTeacher } from 'react-icons/fa';
import { AiOutlineSafetyCertificate } from 'react-icons/ai';
import { FaLocationDot } from 'react-icons/fa6';

function Sidebar({ sidebarOpen, user }) {
    const [credits, setCredits] = useState(0);

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

    return (
        <aside className={`fixed top-0 left-0 z-40 h-screen pt-16 transition-transform transform ${sidebarOpen ? 'translate-x-0' : 'hidden'} md:translate-x-0 md:w-64 bg-blue-900 text-white border-r border-blue-700 overflow-hidden duration-300`}>
            <div className="h-full px-3 pb-4 overflow-y-auto">
                {/* User Info Box */}
                {user && (
                    <div className={`bg-white text-black shadow-md p-4 rounded border border-gray-300 mb-4 mt-4 ${sidebarOpen ? 'block' : 'hidden'}`}>
                        <h3 className="text-lg font-bold flex items-center"><FaUser className="mr-2" /> Welcome, {user.name || user.email}</h3>
                        <p className="mt-2">Remaining Credits: <span className="font-semibold">{credits}</span></p>
                    </div>
                )}
                <ul className="space-y-2 font-medium">
                    <li>
                        <NavLink to="/dashboard3/home" className="flex items-center p-2 hover:bg-blue-700 rounded-lg">
                            <FaUser className="mr-2" /> {sidebarOpen && 'Dashboard'}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard3/generate" className="flex items-center p-2 hover:bg-blue-700 rounded-lg">
                            <FaFileAlt className="mr-2" /> {sidebarOpen && 'Generate Certificate'}
                        </NavLink>
                    </li>
                    {user?.role === 'admin' && (
                        <>
                            <hr className="border-t border-blue-700 my-2" />
                            <li>
                                <div className={`bg-white text-blue-900 shadow-md p-4 rounded-lg mt-4 ${sidebarOpen ? 'block' : 'hidden'}`}>
                                    <h3 className="text-lg font-bold flex items-center"><FaCogs className="mr-2" /> Admin Info</h3>
                                    <p className="mt-2">Total Credits Available: <span className="font-semibold">{credits}</span></p>
                                </div>
                            </li>
                            <li>
                                <NavLink to="/dashboard3/manage-lessons" className="flex items-center p-2 hover:bg-white hover:text-blue-900 rounded-lg">
                                    <FaChalkboardTeacher className="mr-2" /> {sidebarOpen && 'Manage Lessons'}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard3/manage-users" className="flex items-center p-2 hover:bg-white hover:text-blue-900 rounded-lg">
                                    <FaUsers className="mr-2" /> {sidebarOpen && 'Manage Users'}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard3/manage-certifiers" className="flex items-center p-2 hover:bg-white hover:text-blue-900 rounded-lg">
                                    <AiOutlineSafetyCertificate className="mr-2" /> {sidebarOpen && 'Manage Course Certifiers'}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard3/manage-locations" className="flex items-center p-2 hover:bg-white hover:text-blue-900 rounded-lg">
                                    <FaLocationDot className="mr-2" /> {sidebarOpen && 'Manage Locations'}
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;
