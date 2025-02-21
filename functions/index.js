const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');


// 🔥 Firebase Admin SDK Initialisierung (MUSS GANZ OBEN SEIN!)
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const { Storage } = require('@google-cloud/storage');
const storage = new Storage(); // 🔥 Add this line

// Firestore & Auth Instanzen erstellen
const db = admin.firestore();
const auth = admin.auth();
// ✅ Korrekte Referenz für FieldValue
const FieldValue = admin.firestore.FieldValue;
const puppeteer = require("puppeteer");
const PDFDocument = require('pdfkit');
const path = require('path');
const os = require('os');
const fs = require('fs');
const moment = require('moment'); // ✅ Ensure moment.js is required




/**
 * Cloud Function: Erstellt eine PDF-Datei mit einem bestimmten Inhalt
 * und speichert sie in Firebase Storage.
 * 
 * Die Funktion kann über eine HTTP-Request ausgelöst werden.
 */
exports.generatePDF = functions.https.onRequest(async (req, res) => {
    try {
        // Erstellen einer neuen PDF-Datei mit PDFKit
        const doc = new PDFDocument();
        const tempFilePath = path.join(os.tmpdir(), 'generated.pdf'); // Temporäre Datei erstellen
        const writeStream = fs.createWriteStream(tempFilePath);
        doc.pipe(writeStream);

        // PDF-Inhalt hinzufügen
        doc.fontSize(20).text('Hallo, dies ist eine generierte PDF-Datei!', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text('Erstellt mit Firebase Cloud Functions & PDFKit.');
        doc.end();

        // Warten, bis das Schreiben der Datei abgeschlossen ist
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Speicherort in Firebase Storage definieren
        const bucket = storage.bucket('fijo-help-beta.appspot.com'); // Dein Firebase Storage Bucket
        const storageFilePath = `generatedPdfs/generated-${Date.now()}.pdf`;

        // Datei in Firebase Storage hochladen
        await bucket.upload(tempFilePath, {
            destination: storageFilePath,
            metadata: {
                contentType: 'application/pdf',
            },
        });

        // Public Download-URL generieren
        const file = bucket.file(storageFilePath);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2025', // Ablaufdatum der URL
        });

        // Erfolgreiche Antwort senden
        res.status(200).json({
            message: 'PDF erfolgreich generiert!',
            downloadURL: url,
        });

        // Temporäre Datei löschen, um Speicherplatz freizugeben
        fs.unlinkSync(tempFilePath);
    } catch (error) {
        console.error('Fehler beim Erstellen der PDF:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen der PDF' });
    }
});


exports.populateFirestoreAndAuth = functions.https.onRequest(async (req, res) => {
    try {
        console.log("🚀 Populating Firestore and Firebase Auth...");

        /** ✅ Step 1: Create Users in Firebase Auth & Firestore **/
        const users = [
            { email: 'admin@example.com', password: 'password123', role: 'admin', credits: 9999 },
            { email: 'user1@example.com', password: 'password123', role: 'customer', credits: 10 },
            { email: 'user2@example.com', password: 'password123', role: 'customer', credits: 5 }
        ];

        let userRefs = {};
        for (const user of users) {
            const userRecord = await auth.createUser({
                email: user.email,
                password: user.password
            });
            userRefs[user.email] = userRecord.uid;
            await db.collection('users').doc(userRecord.uid).set({
                email: user.email,
                role: user.role,
                credits: user.credits
            });
            if (user.role === 'admin') {
                await auth.setCustomUserClaims(userRecord.uid, { admin: true });
            }
        }
        console.log("✅ Users Created!");

        /** ✅ Step 2: Add Locations **/
        const locations = [
            { name: 'Berlin Training Center', address: '123 Main St, Berlin', certifiers: [], createdOn: new Date().toISOString() },
            { name: 'Munich Training Center', address: '456 Central Rd, Munich', certifiers: [], createdOn: new Date().toISOString() }
        ];
        let locationRefs = [];
        for (const location of locations) {
            const locationRef = await db.collection('locations').add(location);
            locationRefs.push({ id: locationRef.id, ...location });
        }
        console.log("✅ Locations Added!");

        /** ✅ Step 3: Add Certifiers **/
        const certifiers = [
            { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', expertise: ['EHK'], locations: [locationRefs[0].id] },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', expertise: ['EHK'], locations: [locationRefs[1].id] }
        ];
        let certifierRefs = [];
        for (const certifier of certifiers) {
            const certifierRef = await db.collection('certifiers').add(certifier);
            certifierRefs.push({ id: certifierRef.id, ...certifier });
            await db.collection('locations').doc(certifier.locations[0]).set({
                certifiers: [certifierRef.id]
            }, { merge: true });
        }
        console.log("✅ Certifiers Added!");

        /** ✅ Step 4: Add Expertise Options **/
        const expertiseOptions = ['EHK', 'Physics', 'Mathematics', 'Chemistry'];
        for (const expertise of expertiseOptions) {
            await db.collection('expertiseOptions').doc(expertise).set({ name: expertise });
        }
        console.log("✅ Expertise Options Added!");

        /** ✅ Step 5: Add Schedule Instances **/
        const schedules = [
            { date: '2025-02-20', time: '10:00 AM', duration: '2 hours', location: locationRefs[0].id, certifierId: certifierRefs[0].id, maxStudents: 20, attendingStudents: 5, createdOn: new Date().toISOString() },
            { date: '2025-03-10', time: '14:00 PM', duration: '1.5 hours', location: locationRefs[1].id, certifierId: certifierRefs[1].id, maxStudents: 25, attendingStudents: 8, createdOn: new Date().toISOString() }
        ];
        for (const schedule of schedules) {
            await db.collection('scheduleInstances').add(schedule);
        }
        console.log("✅ Schedule Instances Added!");

        /** ✅ Step 6: Add Dummy Certificates **/
        const certificates = [
            { userId: userRefs['user1@example.com'], fullName: 'Student A', lessonDateTime: '2025-02-20 10:00 AM', lessonLocation: locationRefs[0].id, certifierId: certifierRefs[0].id, signatureHash: 'dummyhash1', verified: true },
            { userId: userRefs['user2@example.com'], fullName: 'Student B', lessonDateTime: '2025-03-10 14:00 PM', lessonLocation: locationRefs[1].id, certifierId: certifierRefs[1].id, signatureHash: 'dummyhash2', verified: true }
        ];
        for (const certificate of certificates) {
            await db.collection('certificates').add(certificate);
        }
        console.log("✅ Certificates Added!");
        console.log("🚀 Firestore & Firebase Auth Successfully Populated!");

        res.status(200).json({ message: "Firestore & Firebase Auth populated successfully!" });
    } catch (error) {
        console.error("❌ Error populating Firestore:", error);
        res.status(500).json({ error: "Error populating Firestore" });
    }
});


/**
 * Trigger: Firestore onCreate
 * Description: This function is triggered when a new document is created
 * in the `certificateRequests` collection. It generates a PDF certificate.




exports.generateCertificatePDF = functions.firestore
    .document('certificateRequests/{requestId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const requestId = context.params.requestId;

        try {
            console.log("🚀 Generating Certificate PDF for:", requestId);

            if (data.status !== 'pending') {
                console.log("❌ Status is not 'pending', skipping PDF generation.");
                return null;
            }

            console.log("Fetching lesson details for:", data.lessonInstanceId);

            // Fetch lesson details safely
            if (!data.lessonInstanceId) throw new Error("Missing lessonInstanceId");
            const lessonSnapshot = await db.collection('scheduleInstances').doc(data.lessonInstanceId).get();
            if (!lessonSnapshot.exists) throw new Error(`Lesson instance not found for ID: ${data.lessonInstanceId}`);
            const lessonInstance = lessonSnapshot.data();
            console.log("✅ Lesson instance fetched:", lessonInstance);

            // Fetch certifier details safely
            const certifierId = lessonInstance.certifierId || null;
            let certifier = { firstName: "Unknown", lastName: "" };
            if (certifierId) {
                console.log("Fetching certifier:", certifierId);
                const certifierSnapshot = await db.collection('certifiers').doc(certifierId).get();
                if (certifierSnapshot.exists) {
                    certifier = certifierSnapshot.data();
                    console.log("✅ Certifier fetched:", certifier);
                } else {
                    console.warn(`⚠️ Certifier not found for ID: ${certifierId}`);
                }
            }

            // Fetch location details safely
            const locationId = lessonInstance.location || null;
            let location = { name: "Unknown Location", address: "" };
            if (locationId) {
                console.log("Fetching location:", locationId);
                const locationSnapshot = await db.collection('locations').doc(locationId).get();
                if (locationSnapshot.exists) {
                    location = locationSnapshot.data();
                    console.log("✅ Location fetched:", location);
                } else {
                    console.warn(`⚠️ Location not found for ID: ${locationId}`);
                }
            }

            // Validate lesson time
            if (!lessonInstance.time || !lessonInstance.duration) {
                throw new Error("Invalid lesson time or duration data.");
            }

            // Calculate lesson end time
            console.log("📌 Calculating lesson end time");
            const lessonStart = moment(lessonInstance.time, ['HH:mm A', 'HH:mm']); // Support different time formats
            if (!lessonStart.isValid()) {
                throw new Error(`Invalid lesson start time: ${lessonInstance.time}`);
            }
            const lessonEnd = lessonStart.clone().add(parseFloat(lessonInstance.duration), 'hours').format('HH:mm A');
            console.log(`✅ Lesson time: ${lessonInstance.time} - ${lessonEnd}`);
        
            // Load images
            const logoPath = path.join(__dirname, 'assets/fijohelp-logo.png');
            const stempelPath = path.join(__dirname, 'assets/fijohelp-stempel.png');

            // Create PDF
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const tempFilePath = path.join(os.tmpdir(), `certificate-${requestId}.pdf`);
            const writeStream = fs.createWriteStream(tempFilePath);
            doc.pipe(writeStream);

            data.studentDetails.forEach((student, index) => {
                if (index > 0) doc.addPage();

                // Logo at the top, centered
                doc.image(logoPath, 225, 40, { width: 150 });
                doc.moveDown(3);

                // Title, centered
                doc.fontSize(16).font('Helvetica-Bold').text("Bescheinigung über die Teilnahme an einer Schulung in Erster Hilfe zur Vorlage bei der Fahrerlaubnisbehörde", { align: 'center' });
                doc.moveDown(3);

                // Student details
                doc.fontSize(12).font('Helvetica').text(`Herr/Frau/Divers: `, { continued: true }).font('Helvetica-Bold').text(student.fullName);
                doc.fontSize(12).font('Helvetica').text(`geb. am `, { continued: true }).font('Helvetica-Bold').text(student.dateOfBirth);
                doc.moveDown();

                doc.fontSize(12).text(`hat am (Datum) `, { continued: true }).font('Helvetica-Bold').text(lessonInstance.date);
                doc.fontSize(12).text(` in der Zeit von `, { continued: true }).font('Helvetica-Bold').text(`${lessonInstance.time} Uhr bis ${lessonEnd} Uhr`);
                doc.moveDown();

                doc.fontSize(12).text(`in `, { continued: true }).font('Helvetica-Bold').text(location.name);
                doc.fontSize(12).text("unter der Leitung von ", { continued: true }).font('Helvetica-Bold').text(certifier.firstName + ' ' + certifier.lastName);
                doc.moveDown();

                doc.fontSize(12).text("an einer Schulung in Erster Hilfe mit 9 Unterrichtseinheiten teilgenommen.");
                doc.moveDown();

                doc.fontSize(12).text("Informationsschrift wurde ausgehändigt:");
                doc.fontSize(12).text("✓ Ja", 100, doc.y, { continued: true });
                doc.text("Nein", 200, doc.y);
                doc.moveDown(2);

                // Training Center Name & Stamp
                doc.fontSize(12).text("Name der Ausbildungsstelle:");
                doc.image(stempelPath, 180, doc.y, { width: 150 });
                doc.moveDown(5);



                 v

                // Acknowledgment Details
                doc.fontSize(12).text("Anerkannt am: ", { continued: true }).font('Helvetica-Bold').text("07.03.2024");
                doc.fontSize(12).text("durch (Behörde): Landratsamt Bodenseekreis");
                doc.fontSize(12).text("Aktenzeichen: ", { continued: true }).font('Helvetica-Bold').text("1.13  ⬜ 113.32");
                doc.moveDown(3);

                // Location & Date
                doc.fontSize(12).text(`${location.address}, ${lessonInstance.date}`);
                doc.moveDown(4);

                // Signature
                doc.text("_______________________________________", 100, doc.y);
                doc.text("Unterschrift Lehrgangsleiter", 160, doc.y + 15);
            });

            doc.end();


            // ✅ Wait until PDF is completely written
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            // ✅ Upload PDF to Firebase Storage
            const bucket = admin.storage().bucket();
            const storageFilePath = `certificates/${requestId}.pdf`;

            await bucket.upload(tempFilePath, {
                destination: storageFilePath,
                metadata: {
                    contentType: 'application/pdf',
                },
            });

            // ✅ Make the file public and get the public URL
            const file = bucket.file(storageFilePath);
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFilePath}`;

            // ✅ Update Firestore with the URL and status
            await db.collection('certificateRequests').doc(requestId).update({
                downloadURL: publicUrl,
                status: 'completed'
            });

            console.log("✅ PDF successfully generated and URL saved:", publicUrl);

            // ✅ Clean up: Delete the temporary file
            fs.unlinkSync(tempFilePath);
            return null;

        } catch (error) {
            console.error("❌ Error during PDF generation:", error);

            await db.collection('certificateRequests').doc(requestId).update({
                status: 'error',
                errorMessage: error.message
            });
            return null;
        }
    
    });


 */



exports.generateCertificatePDFHTML = functions.firestore
    .document("certificateRequests/{requestId}")
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const requestId = context.params.requestId;

        try {
            console.log("🚀 Generating Certificate PDF for:", requestId);

            if (data.status !== "pending") {
                console.log("❌ Status is not 'pending', skipping PDF generation.");
                return null;
            }

            console.log("Fetching lesson details for:", data.lessonInstanceId);
            if (!data.lessonInstanceId) throw new Error("Missing lessonInstanceId");
            const lessonSnapshot = await db.collection("scheduleInstances").doc(data.lessonInstanceId).get();
            if (!lessonSnapshot.exists) throw new Error(`Lesson instance not found for ID: ${data.lessonInstanceId}`);
            const lessonInstance = lessonSnapshot.data();
            console.log("✅ Lesson instance fetched:", lessonInstance);

            const certifierId = lessonInstance.certifierId || null;
            let certifier = { firstName: "Unknown", lastName: "" };
            if (certifierId) {
                console.log("Fetching certifier:", certifierId);
                const certifierSnapshot = await db.collection("certifiers").doc(certifierId).get();
                if (certifierSnapshot.exists) certifier = certifierSnapshot.data();
            }

            const locationId = lessonInstance.location || null;
            let location = { name: "Unknown Location", address: "" };
            if (locationId) {
                console.log("Fetching location:", locationId);
                const locationSnapshot = await db.collection("locations").doc(locationId).get();
                if (locationSnapshot.exists) location = locationSnapshot.data();
            }

            if (!lessonInstance.time || !lessonInstance.duration) throw new Error("Invalid lesson time or duration data.");
            console.log("📌 Calculating lesson end time");
            const lessonStart = moment(lessonInstance.time, ['HH:mm A', 'HH:mm']);
            if (!lessonStart.isValid()) throw new Error(`Invalid lesson start time: ${lessonInstance.time}`);
            const lessonEnd = lessonStart.clone().add(parseFloat(lessonInstance.duration), 'hours').format('HH:mm A');
            console.log(`✅ Lesson time: ${lessonInstance.time} - ${lessonEnd}`);

            // Load images
            const logoPath = path.join(__dirname, 'assets/fijohelp-logo.png');
            const stempelPath = path.join(__dirname, 'assets/fijohelp-stempel.png');

            // Generate the HTML template
            const htmlContent = `
               <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Teilnahmebescheinigung</title>
    <style>
        @page { size: A4; margin: 2cm; }
        body {
            font-family: "Lato", sans-serif;
            color: #00000a;
            margin: 0;
            padding: 0;
            line-height: 200%;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            width: 305px;
            height: 106px;
        }
        .title {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
        .section {
            font-size: 12pt;
            margin-top: 15px;
        }
        .bold {
            font-weight: bold;
        }
        .signature {
            margin-top: 50px;
            text-align: left;
        }
        .
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .checkbox-group span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .checkbox {
            width: 12px;
            height: 12px;
            border: 1px solid black;
            display: inline-block;
            text-align: center;
            line-height: 12px;
            font-size: 10px;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            font-size: 12pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="${logoPath}" alt="FijoHelp Logo" />
    </div>
    <div class="title">Bescheinigung über die Teilnahme an einer Schulung in Erster Hilfe zur Vorlage bei der Fahrerlaubnisbehörde</div>
    
    <div class="section">
        <p>Herr/Frau/Divers: <span class="bold">${student.fullName}</span></p>
        <p>Geboren am: <span class="bold">${dateOfBirth}</span></p>
        <p>Hat am (Datum) <span class="bold">${lessonInstance.date}</span> in der Zeit von <span class="bold">${lessonInstance.time} Uhr</span> bis <span class="bold">${lessonInstance.duration} Uhr</span> in <span class="bold">${lessonInstance.location}</span> unter der Leitung von <span class="bold">${certifier}</span> an einer Schulung in Erster Hilfe mit <b>9 Unterrichtseinheiten</b> teilgenommen.</p>
    </div>
    
    <div class="section">
        <p>Informationsschrift wurde ausgehändigt:</p>
        <div class="checkbox-group">
            <span><div class="checkbox">✓</div> Ja</span>
            <span><div class="checkbox"></div> Nein</span>
        </div>
    </div>
    
    <div class="section">
        <p>Name der Ausbildungsstelle:</p>
        <img src="${stempelPath}" alt="Stempel" width="150" />
    </div>
    
    <div class="footer">
        <p>Anerkannt am: <span class="bold">07.03.2024</span></p>
        <p>durch (Behörde): Landratsamt Bodenseekreis</p>
        <p>Aktenzeichen: <span class="bold">1.13 ⬜ 113.32</span></p>
    </div>
    
    <div class="footer">
        <p>${lessonInstance.location}, ${lessonInstance.date}</p>
        <p>_______________________________________, _____________________________________</p>
        <p>Ort Datum</p>
        <p>______________________________________________</p>
        <p>Unterschrift Lehrgangsleiter</p>
    </div>
</body>
</html>


            `;

            console.log("🖨️ Generating PDF with Puppeteer");
            const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: "networkidle0" });
            const pdfBuffer = await page.pdf({ format: "A4" });
            await browser.close();

            console.log("✅ PDF generated successfully");
            const tempFilePath = path.join(os.tmpdir(), `certificate-${requestId}.pdf`);
            fs.writeFileSync(tempFilePath, pdfBuffer);

            console.log("📤 Uploading PDF to Firebase Storage");
            const bucket = admin.storage().bucket();
            const storageFilePath = `certificates/${requestId}.pdf`;
            await bucket.upload(tempFilePath, {
                destination: storageFilePath,
                metadata: { contentType: "application/pdf" },
            });

            console.log("🔗 Making file public");
            const file = bucket.file(storageFilePath);
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFilePath}`;

            console.log("✅ PDF successfully uploaded and URL saved:", publicUrl);
            await db.collection("certificateRequests").doc(requestId).update({
                downloadURL: publicUrl,
                status: "completed"
            });

            fs.unlinkSync(tempFilePath);
            return null;
        } catch (error) {
            console.error("❌ Error during PDF generation:", error);
            await db.collection("certificateRequests").doc(requestId).update({
                status: "error",
                errorMessage: error.message
            });
            return null;
        }
    });
