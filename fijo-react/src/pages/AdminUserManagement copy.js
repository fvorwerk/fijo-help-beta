import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'customer', credits: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const addUser = async () => {
        if (!newUser.email || !newUser.password) {
            alert('Email and password are required');
            return;
        }
        try {
            // ✅ Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const userId = userCredential.user.uid;

            // ✅ Store user details in Firestore
            await setDoc(doc(db, 'users', userId), {
                email: newUser.email,
                role: newUser.role,
                credits: newUser.credits
            });

            fetchUsers();
            setNewUser({ email: '', password: '', role: 'customer', credits: 0 });
            alert('User successfully added!');
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Error adding user: ' + error.message);
        }
    };

    const updateUser = async (id, field, value) => {
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, { [field]: value });
        fetchUsers();
    };

    const deleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteDoc(doc(db, 'users', id));
            fetchUsers();
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-5">
                <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
                
                <div className="bg-white p-5 shadow-md rounded mb-5">
                    <h3 className="text-lg font-bold">Add New User</h3>
                    <input type="email" name="email" placeholder="Email" className="border p-2 rounded w-full mb-2" value={newUser.email} onChange={handleInputChange} />
                    <input type="password" name="password" placeholder="Password" className="border p-2 rounded w-full mb-2" value={newUser.password} onChange={handleInputChange} />
                    <select name="role" className="border p-2 rounded w-full mb-2" value={newUser.role} onChange={handleInputChange}>
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input type="number" name="credits" placeholder="Credits" className="border p-2 rounded w-full mb-2" value={newUser.credits} onChange={handleInputChange} />
                    <button onClick={addUser} className="bg-blue-500 text-white px-4 py-2 rounded">Add User</button>
                </div>
                
                <h3 className="text-lg font-bold mb-3">Existing Users</h3>
                {users.map(user => (
                    <div key={user.id} className="bg-white p-5 shadow-md rounded mb-3">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p>
                            <strong>Credits:</strong> 
                            <input type="number" className="border p-2 ml-2 rounded" defaultValue={user.credits} onBlur={(e) => updateUser(user.id, 'credits', parseInt(e.target.value))} />
                        </p>
                        <button onClick={() => deleteUser(user.id)} className="bg-red-500 text-white px-4 py-2 mt-2 rounded">Delete</button>
                    </div>
                ))}
            </main>
            <Footer />
        </div>
    );
}

export default AdminUserManagement;
