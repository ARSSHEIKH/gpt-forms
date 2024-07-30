// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('@/config/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://davat-ceb73.firebaseio.com',
    });
}
module.exports = admin;
