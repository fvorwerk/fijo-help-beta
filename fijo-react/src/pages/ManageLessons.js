import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import Stepper from '../components/Stepper';
import { FaExclamationTriangle } from 'react-icons/fa';

function ManageLessons() {
    const [step, setStep] = useState(0);
    const [lessons, setLessons] = useState([]);
    const [locations, setLocations] = useState([]);
    const [certifiers, setCertifiers] = useState([]);
    const [expertises, setExpertises] = useState([]);
    const [newLesson, setNewLesson] = useState({
        date: '', time: '', duration: '', location: '', certifier: '', expertise: '', maxStudents: 0
    });    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    useEffect(() => {
        fetchLessons();
        fetchLocations();
        fetchCertifiers();
        fetchExpertises();
    }, []);

    const fetchLessons = async () => {
        const querySnapshot = await getDocs(collection(db, 'scheduleInstances'));
        setLessons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchLocations = async () => {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        setLocations(querySnapshot.docs.map(doc => doc.data()));
    };

    const fetchCertifiers = async () => {
        const querySnapshot = await getDocs(collection(db, 'certifiers'));
        setCertifiers(querySnapshot.docs.map(doc => doc.data()));
    };

    const fetchExpertises = async () => {
        const querySnapshot = await getDocs(collection(db, 'expertiseOptions'));
        setExpertises(querySnapshot.docs.map(doc => doc.id));
    };

    const handleInputChange = (e) => {
        setNewLesson({ ...newLesson, [e.target.name]: e.target.value });
    };

    const handleAddClick = () => {
        setModalAction("add");
        setIsModalOpen(true);
    };

    const confirmAddLesson = async () => {
        if (!newLesson.date || !newLesson.time || !newLesson.duration || !newLesson.location || !newLesson.certifier || !newLesson.expertise) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            await addDoc(collection(db, 'scheduleInstances'), { ...newLesson, createdOn: serverTimestamp() });
            fetchLessons();
            setNewLesson({ date: '', time: '', duration: '', location: '', certifier: '', expertise: '', maxStudents: 0 });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding lesson:", error);
        }
    };

    const handleDeleteClick = (lesson) => {
        setSelectedLesson(lesson);
        setModalAction("delete");
        setIsModalOpen(true);
    };

    const confirmDeleteLesson = async () => {
        if (selectedLesson) {
            await deleteDoc(doc(db, 'scheduleInstances', selectedLesson.id));
            fetchLessons();
        }
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-5">
                <div className="bg-white shadow-md p-5 rounded mb-5">
                    <h3 className="text-lg font-bold">Existing Lessons</h3>
                    {lessons.map(lesson => (
                        <div key={lesson.id} className="border p-4 rounded mb-2 shadow-sm flex justify-between items-center">
                            <p>{lesson.date} - {lesson.location} ({lesson.certifier})</p>
                            <button onClick={() => handleDeleteClick(lesson)} className="bg-red-500 px-3 py-1 text-white rounded">Delete</button>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-5 shadow-md rounded mb-5">
                    <Stepper currentStep={step} steps={['Enter Details', 'Review & Confirm']} />
                    {step === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="date" name="date" className="border p-2 rounded" value={newLesson.date} onChange={handleInputChange} />
                            <input type="time" name="time" className="border p-2 rounded" value={newLesson.time} onChange={handleInputChange} />
                            <input type="text" name="duration" className="border p-2 rounded" value={newLesson.duration} onChange={handleInputChange} placeholder="Duration" />
                            <select name="location" className="border p-2 rounded" value={newLesson.location} onChange={handleInputChange}>
                                <option value="">Select Location</option>
                                {locations.map((loc, index) => (
                                    <option key={index} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                            <select name="certifier" className="border p-2 rounded" value={newLesson.certifier} onChange={handleInputChange}>
                                <option value="">Select Certifier</option>
                                {certifiers.map((cert, index) => (
                                    <option key={index} value={cert.id}>{cert.firstName} {cert.lastName}</option>
                                ))}
                            </select>
                            <select name="expertise" className="border p-2 rounded" value={newLesson.expertise} onChange={handleInputChange}>
                                <option value="">Select Expertise</option>
                                {expertises.map((exp, index) => (
                                    <option key={index} value={exp}>{exp}</option>
                                ))}
                            </select>
                            <div className="flex justify-between w-full mt-4">
                                <button onClick={() => setStep(1)} className="bg-blue-500 px-4 py-2 text-white rounded w-full">Next</button>
                            </div>
                        </div>
                    )}
                    {step === 1 && (
                        <div className="text-center">
                            <p>Confirm Lesson Details</p>
                            <p>{newLesson.date} at {newLesson.time} - {newLesson.location} - {newLesson.expertise}</p>
                            <div className="flex justify-between w-full mt-4">
                                <button onClick={() => setStep(0)} className="bg-gray-500 px-4 py-2 text-white rounded">Back</button>
                                <button onClick={handleAddClick} className="bg-green-500 px-4 py-2 text-white rounded">Confirm & Add Lesson</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalAction === "delete" ? confirmDeleteLesson : confirmAddLesson}
                title={modalAction === "delete" ? "Confirm Deletion" : "Confirm Addition"}
                message={modalAction === "delete" ? `Are you sure you want to delete this lesson?` : "Are you sure you want to add this lesson?"}
                confirmText={modalAction === "delete" ? "Delete" : "Add"}
                cancelText="Cancel"
                icon={modalAction === "delete" ? <FaExclamationTriangle /> : null}
            />
        </div>
    );
}

export default ManageLessons;
