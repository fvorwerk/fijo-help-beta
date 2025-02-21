import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { db } from '../firebase';
import { FaUser, FaFileAlt, FaLock, FaShoppingCart, FaCogs, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import { FaLocationDot } from "react-icons/fa6";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { GrCertificate } from "react-icons/gr";

function Home() {
    const { user, loading } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [credits, setCredits] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                const userQuery = query(collection(db, 'users'), where("email", "==", user.email));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    setCredits(userSnapshot.docs[0].data().credits || 0);
                }
                const certQuery = query(collection(db, 'certificates'), where("userId", "==", user.uid));
                const certSnapshot = await getDocs(certQuery);
                setCertificates(certSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
        fetchUserData();
    }, [user]);

    if (loading) return <p className="text-center text-lg">Loading...</p>;
    if (!user) return navigate('/');

    return (
        <div className="flex flex-col flex-grow bg-gray-100 p-4">
            <main className="flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* User Info Card */}
                    <div className="bg-white shadow-md p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-bold flex items-center"><FaUser className="mr-2" /> User Info</h3>
                        <p className="mt-2">Remaining Credits: <span className="font-semibold">{credits}</span></p>
                    </div>
                    {/* Generate Certificate */}
                    <div className="bg-white shadow-md p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-bold flex items-center"><FaFileAlt className="mr-2" /> Generate Certificate</h3>
                        <button onClick={() => navigate('/dashboard3/generate')} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition">
                            Generate Certificate
                        </button>
                    </div>
                    {/* Certificates List */}
                    <div className="bg-white shadow-md p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-bold flex items-center"><GrCertificate className="mr-2" /> Your Certificates</h3>
                        <ul className="mt-2">
                            {certificates.length > 0 ? (
                                certificates.map(cert => (
                                    <li key={cert.id} className="border p-2 my-2 rounded bg-gray-100">
                                        {cert.fullName} - {cert.lessonDateTime} ({cert.lessonLocation})
                                    </li>
                                ))
                            ) : (
                                <p>No certificates found.</p>
                            )}
                        </ul>
                    </div>
                 {/* Admin Features (Inverted Colors) */}
                                    {user.role === 'admin' && (
                                        <>
                                            <div className="bg-blue-700 text-white shadow-md p-4 rounded cursor-pointer hover:bg-blue-800">
                                                <h3 className="text-lg font-bold flex items-center"><FaCogs className="mr-2" /> Admin Info</h3>
                                                <p className="mt-2">Total Credits Available: <span className="font-semibold">{credits}</span></p>
                                            </div>
                                            <div className="bg-blue-700 text-white shadow-md p-4 rounded cursor-pointer hover:bg-blue-800" onClick={() => navigate('/manage-lessons')}>
                                                <h3 className="text-lg font-bold flex items-center"><FaChalkboardTeacher className="mr-2" /> Manage Lessons</h3>
                                                <p className="mt-2">View and edit lesson schedules.</p>
                                            </div>
                                            <div className="bg-blue-700 text-white shadow-md p-4 rounded cursor-pointer hover:bg-blue-800" onClick={() => navigate('/manage-users')}>
                                                <h3 className="text-lg font-bold flex items-center"><FaUsers className="mr-2" /> Manage Users</h3>
                                                <p className="mt-2">Create, delete, and modify users.</p>
                                            </div>
                                            <div className="bg-blue-700 text-white shadow-md p-4 rounded cursor-pointer hover:bg-blue-800" onClick={() => navigate('/manage-certifiers')}>
                                                <h3 className="text-lg font-bold flex items-center"><AiOutlineSafetyCertificate className="mr-2" /> Manage Course Certifiers</h3>
                                                <p className="mt-2">Create, delete, and modify certifiers.</p>
                                            </div>
                                            <div className="bg-blue-700 text-white shadow-md p-4 rounded cursor-pointer hover:bg-blue-800" onClick={() => navigate('/manage-locations')}>
                                                <h3 className="text-lg font-bold flex items-center"><FaLocationDot className="mr-2" /> Manage Locations</h3>
                                                <p className="mt-2">Create, delete, and modify Locations.</p>
                                            </div>
                                        </>
                                    )}
                    {/* Coming Soon Features */}
                    {user.role === 'customer' && (
                        <>
                            <div className="bg-white shadow-md p-4 rounded border border-gray-300 opacity-50 cursor-not-allowed">
                                <h3 className="text-lg font-bold flex items-center"><FaLock className="mr-2" /> Blockchain Explorer (Coming Soon)</h3>
                                <p className="mt-2">Explore the authenticity of certificates.</p>
                            </div>
                            <div className="bg-white shadow-md p-4 rounded border border-gray-300 opacity-50 cursor-not-allowed">
                                <h3 className="text-lg font-bold flex items-center"><FaShoppingCart className="mr-2" /> Buy Credits (Coming Soon)</h3>
                                <p className="mt-2">Purchase additional credits.</p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;
