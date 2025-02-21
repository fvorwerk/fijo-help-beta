import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';
import { db, auth } from '../firebase';

function AdminDashboard() {
    const { user, loading } = useAuth();
    const [credits, setCredits] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchAdminData = async () => {
            try {
                const userQuery = query(collection(db, 'users'), where("email", "==", user.email));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    setCredits(userSnapshot.docs[0].data().credits || 0);
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
        fetchAdminData();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return navigate('/');

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-5">
                <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white shadow-md p-4 rounded">
                        <h3 className="text-lg font-bold">Admin Info</h3>
                        <p className="mt-2">Total Credits Available: <span className="font-semibold">{credits}</span></p>
                    </div>
                    <div className="bg-white shadow-md p-4 rounded cursor-pointer hover:bg-gray-100" onClick={() => navigate('/manage-lessons')}>
                        <h3 className="text-lg font-bold">Manage Lessons</h3>
                        <p>View and edit lesson schedules.</p>
                    </div>
                    <div className="bg-white shadow-md p-4 rounded cursor-pointer hover:bg-gray-100" onClick={() => navigate('/manage-users')}>
                        <h3 className="text-lg font-bold">Manage Users</h3>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default AdminDashboard;
