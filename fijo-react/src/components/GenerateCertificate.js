import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import Stepper from '../components/Stepper';
import CertificateProcessing from '../components/CertificateProcessing';
import Modal from '../components/Modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthProvider';
import { collection, getDocs, getDoc, updateDoc, doc, addDoc, onSnapshot, query, where } from 'firebase/firestore';

function GenerateCertificate() {
  const [step, setStep] = useState(0);
  const [scheduleInstances, setScheduleInstances] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [formData, setFormData] = useState({ fullName: '', dateOfBirth: '', gender: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [availableCredits, setAvailableCredits] = useState(10);
  const [downloadURL, setDownloadURL] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchScheduleInstances = async () => {
      const scheduleSnapshot = await getDocs(collection(db, 'scheduleInstances'));
      setScheduleInstances(scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchScheduleInstances();
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setAvailableCredits(userDoc.data().credits);
    }
  };

  const handleSelectInstance = (instanceId) => {
    setSelectedInstance(scheduleInstances.find(inst => inst.id === instanceId));
    setStep(1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCertificate = () => {
    if (!formData.fullName || !formData.dateOfBirth || !formData.gender || !selectedInstance) {
      alert('Please fill in all fields and select a lesson instance');
      return;
    }
    setCertificates([...certificates, { ...formData, lessonInstance: selectedInstance }]);
    setFormData({ fullName: '', dateOfBirth: '', gender: '' });
  };

  const removeCertificate = (index) => {
    setSelectedCertificate(certificates[index]);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const confirmRemoveCertificate = () => {
    setCertificates(certificates.filter((_, i) => i !== certificates.indexOf(selectedCertificate)));
    setIsModalOpen(false);
  };

  const handleConfirmGeneration = async () => {
    if (availableCredits < certificates.length) {
      alert("Not enough credits to generate these certificates.");
      return;
    }

    try {
      const certificateRef = collection(db, "certificateRequests");
      const newRequest = {
        userId: user.uid,
        lessonInstanceId: selectedInstance.id,
        studentDetails: certificates,
        status: "pending",
        timestamp: new Date(),
        downloadURL: "",
        hash: ""
      };

      const docRef = await addDoc(certificateRef, newRequest);
      console.log("Certificate request stored with ID:", docRef.id);

      await updateDoc(doc(db, "users", user.uid), {
        credits: availableCredits - certificates.length,
      });

      setStep(4);
    } catch (error) {
      console.error("Error storing certificate request:", error);
    }
  };

  useEffect(() => {

    if (step === 4 && user) {
      const q = query(
        collection(db, "certificateRequests"),
        where("userId", "==", user.uid),
        where("status", "==", "completed")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          setDownloadURL(doc.data().downloadURL);
          setStep(5);
        });
      });

      return () => {
        if (unsubscribe) unsubscribe();
      }; // Ensure cleanup is handled properly
    }
  }, [step, user]);




  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-5">
      <Stepper
  currentStep={step}
  steps={['Select Lesson Instance', 'Enter Student Details', 'Review & Edit', 'Final Confirmation', 'Processing Certificates', 'Download Certificates']}
/>

        {/* Step 1: Select Lesson Instance */}
        {step === 0 && (
          <div className="bg-white shadow-md p-5 rounded mb-5">
            <h3 className="text-lg font-bold mb-2">Select Lesson Instance</h3>
            <ul className="space-y-3">
              {scheduleInstances.map(instance => (
                <li key={instance.id} className="border p-2 rounded flex items-center">
                  <input type="radio" name="selectedInstance" value={instance.id} checked={selectedInstance?.id === instance.id} onChange={() => handleSelectInstance(instance.id)} className="mr-2" />
                  <span>{instance.date} {instance.time} - {instance.duration} ({instance.location}) - Certifier: {instance.certifierId}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded cursor-not-allowed opacity-50" disabled>&lt; Back</button>
              <button onClick={() => setStep(1)} disabled={!selectedInstance} className="px-4 py-2 bg-blue-500 text-white rounded">Next &gt;</button>
            </div>
          </div>
        )}

        {/* Step 2: Enter Student Details */}
        {step === 1 && selectedInstance && (
          <div className="bg-white shadow-md p-5 rounded mb-5">
            <h3 className="text-lg font-bold mb-2">Enter Student Information</h3>
            <input type="text" name="fullName" placeholder="Full Name" className="p-2 border rounded w-full mb-2" value={formData.fullName} onChange={handleChange} />
            <input type="date" name="dateOfBirth" className="p-2 border rounded w-full mb-2" value={formData.dateOfBirth} onChange={handleChange} />
            <select name="gender" className="p-2 border rounded w-full mb-2" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={addCertificate} className="px-4 py-2 bg-green-500 text-white rounded">Add Student</button>

            {/* Student List Display */}
            <h3 className="text-lg font-bold mt-4">Added Students</h3>
            <ul>
              {certificates.map((cert, index) => (
                <li key={index} className="border p-2 rounded mb-2 flex justify-between">
                  <span>{cert.fullName} - {cert.lessonInstance.date} ({cert.lessonInstance.location})</span>
                  <button onClick={() => removeCertificate(index)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(0)} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">&lt; Back</button>
              <button onClick={() => setStep(2)} disabled={certificates.length === 0} className="px-4 py-2 bg-blue-500 text-white rounded">Next &gt;</button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Edit Certificates */}
        {step === 2 && (
          <div className="bg-white shadow-md p-5 rounded mb-5">
            <h3 className="text-lg font-bold mb-2">Review Certificates</h3>
            <ul>
              {certificates.map((cert, index) => (
                <li key={index} className="border p-2 rounded mb-2 flex justify-between">
                  <span>{cert.fullName} - {cert.lessonInstance.date} ({cert.lessonInstance.location})</span>
                  <button onClick={() => removeCertificate(index)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-blue-500 text-blue-500 rounded">&lt; Back</button>
              <button onClick={() => setStep(3)} className="px-4 py-2 bg-blue-500 text-white rounded">Next &gt;</button>
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 3 && (
          <div className="bg-white shadow-md p-5 rounded mb-5 text-center">
            <h3 className="text-lg font-bold mb-2">Final Confirmation</h3>
            <p>You are about to generate certificates for the following students:</p>
            {/* Display Student List */}
            <ul className="mt-4">
              {certificates.map((cert, index) => (
                <li key={index} className="border p-2 rounded mb-2">
                  {cert.fullName} - {cert.lessonInstance.date} ({cert.lessonInstance.location})
                </li>
              ))}
            </ul>

            {/* Display Credit Information */}
            <div className="bg-gray-100 p-4 rounded-md mt-4 text-left">
              <p className="text-md text-gray-700">
                Your available credits: <span className="font-bold text-green-600">{availableCredits}</span>
              </p>
              <p className="text-md text-gray-700">
                Certificates to generate: <span className="font-bold text-red-600">{certificates.length}</span>
              </p>
              <p className="text-md text-gray-700">
                After this transaction, remaining credits:{" "}
                <span className="font-bold text-blue-600">
                  {Math.max(availableCredits - certificates.length, 0)}
                </span>
              </p>
            </div>



            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-blue-500 text-blue-500 rounded"
              >
                &lt; Back
              </button>
              <button
                onClick={handleConfirmGeneration}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Confirm & Generate &gt;
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Processing Certificates */}
        {step === 4 && (
          <CertificateProcessing userId={user.uid} onComplete={() => setStep(5)} />
        )}

        {/* Step 6: Download Certificates */}
{step === 5 && (
  <div className="bg-white shadow-md p-5 rounded mb-5 text-center">
    <h3 className="text-lg font-bold mb-2">Certificate Ready for Download</h3>
    <p>Your certificate has been generated successfully.</p>
    <a href={downloadURL} download className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
      Download Certificate
    </a>
  </div>
)}


      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={modalAction === 'delete' ? confirmRemoveCertificate : null} title={modalAction === 'delete' ? 'Confirm Removal' : 'Confirm Generation'} message={modalAction === 'delete' ? 'Are you sure you want to remove this student?' : 'Proceed with generating certificates?'} confirmText={modalAction === 'delete' ? 'Remove' : 'Confirm'} cancelText="Cancel" icon={<FaExclamationTriangle />} />
    </div>
  );
}
export default GenerateCertificate;
