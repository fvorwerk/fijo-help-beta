import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function CertificateProcessing({ requestId }) {
  const [status, setStatus] = useState('pending'); // Initial status
  const [downloadURL, setDownloadURL] = useState(null);
  const [progressMessage, setProgressMessage] = useState('Processing Certificates...');

  useEffect(() => {
    if (!requestId) return;

    // Listen for Firestore updates on the certificate request
    const requestRef = doc(db, 'certificateRequests', requestId);
    const unsubscribe = onSnapshot(requestRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setStatus(data.status);
        if (data.downloadURL) {
          setDownloadURL(data.downloadURL);
        }
      }
    });
    
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [requestId]);

  // Simulated step-based updates
  useEffect(() => {
    let timer;

    if (status === 'pending') {
      setProgressMessage('Processing Certificates...');
      timer = setTimeout(() => setStatus('generating'), 3000);
    } else if (status === 'generating') {
      setProgressMessage('Generating PDF...');
      timer = setTimeout(() => setStatus('signing'), 4000);
    } else if (status === 'signing') {
      setProgressMessage('Applying Digital Signature...');
      timer = setTimeout(() => setStatus('uploading'), 3000);
    } else if (status === 'uploading') {
      setProgressMessage('Uploading Certificate...');
      timer = setTimeout(() => setStatus('completed'), 4000);
    }

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className="bg-white shadow-md p-5 rounded text-center">
      <h3 className="text-lg font-bold mb-2">Certificate Processing</h3>
      {!downloadURL ? (
        <>
          <p className="text-gray-600">{progressMessage}</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
          </div>
        </>
      ) : (
        <>
          <p className="text-green-600 font-bold">Your certificate is ready!</p>
          <a
            href={downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Download Certificate
          </a>
        </>
      )}
    </div>
  );
}

export default CertificateProcessing;
