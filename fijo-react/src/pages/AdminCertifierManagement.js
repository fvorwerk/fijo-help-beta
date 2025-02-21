import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function AdminCertifierManagement() {
    const [certifiers, setCertifiers] = useState([]);
    const [expertiseOptions, setExpertiseOptions] = useState([]);
    const [newCertifier, setNewCertifier] = useState({ gender: '', firstName: '', lastName: '', email: '', expertise: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedCertifier, setSelectedCertifier] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCertifiers();
        fetchExpertiseOptions();
    }, []);

    const fetchCertifiers = async () => {
        const querySnapshot = await getDocs(collection(db, 'certifiers'));
        setCertifiers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchExpertiseOptions = async () => {
        const querySnapshot = await getDocs(collection(db, 'expertiseOptions'));
        setExpertiseOptions(querySnapshot.docs.map(doc => doc.id));
    };

    const handleInputChange = (e) => {
        setNewCertifier({ ...newCertifier, [e.target.name]: e.target.value });
    };

    const handleExpertiseChange = (e) => {
        const value = e.target.value;
        setNewCertifier(prevState => ({
            ...prevState,
            expertise: prevState.expertise.includes(value)
                ? prevState.expertise.filter(ex => ex !== value)
                : [...prevState.expertise, value]
        }));
    };

    const handleDeleteClick = (certifier) => {
        setSelectedCertifier(certifier);
        setModalAction("delete");
        setIsModalOpen(true);
    };

    const confirmDeleteCertifier = async () => {
        if (selectedCertifier) {
            await deleteDoc(doc(db, 'certifiers', selectedCertifier.id));
            fetchCertifiers();
        }
        setIsModalOpen(false);
    };

    const handleAddClick = () => {
        setModalAction("add");
        setIsModalOpen(true);
    };

    const confirmAddCertifier = async () => {
        if (!newCertifier.gender || !newCertifier.firstName || !newCertifier.lastName || !newCertifier.email || newCertifier.expertise.length === 0) {
            alert('All fields are required, including at least one expertise');
            return;
        }
        await addDoc(collection(db, 'certifiers'), {
            ...newCertifier,
            createdOn: serverTimestamp()
        });
        fetchCertifiers();
        setNewCertifier({ gender: '', firstName: '', lastName: '', email: '', expertise: [] });
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-5">
                <h2 className="text-2xl font-bold mb-4">Manage Course Certifiers</h2>
                
                <div className="bg-white p-5 shadow-md rounded mb-5">
                    <h3 className="text-lg font-bold">Add New Certifier</h3>
                    <select name="gender" className="border p-2 rounded w-full mb-2" value={newCertifier.gender} onChange={handleInputChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" name="firstName" placeholder="First Name" className="border p-2 rounded w-full mb-2" value={newCertifier.firstName} onChange={handleInputChange} />
                    <input type="text" name="lastName" placeholder="Last Name" className="border p-2 rounded w-full mb-2" value={newCertifier.lastName} onChange={handleInputChange} />
                    <input type="email" name="email" placeholder="Email" className="border p-2 rounded w-full mb-2" value={newCertifier.email} onChange={handleInputChange} />
                    
                    <fieldset className="mt-4">
                        <legend className="text-sm font-semibold text-gray-900">Expertise</legend>
                        <p className="mt-1 text-sm text-gray-600">Select at least one expertise.</p>
                        <div className="mt-4 space-y-4">
                            {expertiseOptions.map((option, index) => (
                                <div key={index} className="flex items-center gap-x-3">
                                    <input
                                        type="checkbox"
                                        id={`expertise-${index}`}
                                        value={option}
                                        checked={newCertifier.expertise.includes(option)}
                                        onChange={handleExpertiseChange}
                                        className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`expertise-${index}`} className="block text-sm font-medium text-gray-900">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    
                    <button onClick={handleAddClick} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Add Certifier</button>
                </div>
                
                <h3 className="text-lg font-bold mb-3">Existing Certifiers</h3>
                {certifiers.map(certifier => (
                    <div key={certifier.id} className="bg-white p-5 shadow-md rounded mb-3">
                        <p><strong>Name:</strong> {certifier.firstName} {certifier.lastName}</p>
                        <p><strong>Email:</strong> {certifier.email}</p>
                        <p><strong>Expertise:</strong> {Array.isArray(certifier.expertise) ? certifier.expertise.join(', ') : "No expertise assigned"}</p>
                        <button onClick={() => handleDeleteClick(certifier)} className="bg-red-500 text-white px-4 py-2 mt-2 rounded">Delete</button>
                    </div>
                ))}
                
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={modalAction === "delete" ? confirmDeleteCertifier : confirmAddCertifier}
                    title={modalAction === "delete" ? "Confirm Deletion" : "Confirm Addition"}
                    message={modalAction === "delete" ? `Are you sure you want to delete ${selectedCertifier?.firstName} ${selectedCertifier?.lastName}?` : "Are you sure you want to add this certifier?"}
                    confirmText={modalAction === "delete" ? "Delete" : "Add"}
                    cancelText="Cancel"
                    icon={modalAction === "delete" ? <FaExclamationTriangle /> : null}
                />
            </main>
            <Footer />
        </div>
    );
}

export default AdminCertifierManagement;
