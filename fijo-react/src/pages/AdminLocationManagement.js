import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

function AdminLocationManagement() {
    const [locations, setLocations] = useState([]);
    const [certifiers, setCertifiers] = useState([]);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', certifiers: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetchLocations();
        fetchCertifiers();
    }, []);

    

    const fetchCertifiers = async () => {
        const querySnapshot = await getDocs(collection(db, 'certifiers'));
        setCertifiers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (e) => {
        setNewLocation({ ...newLocation, [e.target.name]: e.target.value });
    };

    const handleCertifierChange = (e) => {
        const selectedCertifiers = Array.from(e.target.selectedOptions, option => option.value);
        setNewLocation({ ...newLocation, certifiers: selectedCertifiers });
    };

    const handleDeleteClick = (location) => {
        setSelectedLocation(location);
        setModalAction("delete");
        setIsModalOpen(true);
    };

    const confirmDeleteLocation = async () => {
        if (selectedLocation) {
            await deleteDoc(doc(db, 'locations', selectedLocation.id));
            fetchLocations();
        }
        setIsModalOpen(false);
    };

    const handleAddClick = () => {
        setModalAction("add");
        setIsModalOpen(true);
    };

    const confirmAddLocation = async () => {
        if (!newLocation.name || !newLocation.address || newLocation.certifiers.length === 0) {
            alert('All fields are required, including at least one certifier');
            return;
        }
        await addDoc(collection(db, 'locations'), {
            ...newLocation,
            createdOn: serverTimestamp()
        });
        fetchLocations();
        setNewLocation({ name: '', address: '', certifiers: [] });
        setIsModalOpen(false);
    };

    const fetchLocations = async () => {
        const certifiersSnapshot = await getDocs(collection(db, 'certifiers'));
        const certifiersMap = {};
    
        // Certifier-Daten in einer Map speichern (ID als Schlüssel, Name als Wert)
        certifiersSnapshot.forEach(doc => {
            const certifierData = doc.data();
            certifiersMap[doc.id] = `${certifierData.firstName} ${certifierData.lastName}`;
        });
    
        const querySnapshot = await getDocs(collection(db, 'locations'));
    
        // Locations holen und Certifier-IDs durch Namen ersetzen
        const locationsWithNames = querySnapshot.docs.map(doc => {
            const locationData = doc.data();
            const certifierNames = locationData.certifiers.map(certifierId => 
                certifiersMap[certifierId] || "Unbekannt"
            );
    
            return { 
                id: doc.id, 
                ...locationData, 
                certifiers: certifierNames  // Certifier-Namen anstelle der IDs
            };
        });
    
        setLocations(locationsWithNames);
    };
    

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-5">
                <h2 className="text-2xl font-bold mb-4">Manage Course Locations</h2>

                <div className="bg-white p-5 shadow-md rounded mb-5">
                    <h3 className="text-lg font-bold">Add New Location</h3>
                    <input type="text" name="name" placeholder="Location Name" className="border p-2 rounded w-full mb-2" value={newLocation.name} onChange={handleInputChange} />
                    <input type="text" name="address" placeholder="Address" className="border p-2 rounded w-full mb-2" value={newLocation.address} onChange={handleInputChange} />

                    <fieldset className="mt-4">
                        <legend className="text-sm font-semibold text-gray-900">Assign Certifiers</legend>
                        <p className="mt-1 text-sm text-gray-600">Select at least one certifier.</p>
                        <select multiple className="border p-2 rounded w-full" onChange={handleCertifierChange}>
                            {certifiers.map((certifier) => (
                                <option key={certifier.id} value={certifier.id}>{certifier.firstName} {certifier.lastName}</option>
                            ))}
                        </select>
                    </fieldset>

                    <button onClick={handleAddClick} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Add Location</button>
                </div>

                <h3 className="text-lg font-bold mb-3">Existing Locations</h3>
                {locations.map(location => (
                    <div key={location.id} className="bg-white p-5 shadow-md rounded mb-3">
                        <p><strong>Name:</strong> {location.name}</p>
                        <p><strong>Address:</strong> {location.address}</p>
                        <p><strong>Certifiers:</strong> {location.certifiers.join(', ')}</p>
                        <p><strong>Created On:</strong>
                            {location.createdOn instanceof Object && "toDate" in location.createdOn
                                ? location.createdOn.toDate().toLocaleString()
                                : new Date(location.createdOn).toLocaleString()}
                        </p>
                        <button onClick={() => handleDeleteClick(location)} className="bg-red-500 text-white px-4 py-2 mt-2 rounded">Delete</button>
                    </div>
                ))}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={modalAction === "delete" ? confirmDeleteLocation : confirmAddLocation}
                    title={modalAction === "delete" ? "Confirm Deletion" : "Confirm Addition"}
                    message={modalAction === "delete" ? `Are you sure you want to delete ${selectedLocation?.name}?` : "Are you sure you want to add this location?"}
                    confirmText={modalAction === "delete" ? "Delete" : "Add"}
                    cancelText="Cancel"
                    icon={modalAction === "delete" ? <FaExclamationTriangle /> : null}
                />
            </main>
            <Footer />
        </div>
    );
}

export default AdminLocationManagement;
