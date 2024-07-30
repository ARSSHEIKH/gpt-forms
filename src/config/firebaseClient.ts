// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {collection, getFirestore, FirestoreSettings, initializeFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
  apiKey: "AIzaSyBJNJE8ELLNAEaXy9An4IHXV_oFPbF9AhM",
  authDomain: "davat-ceb73.firebaseapp.com",
  projectId: "davat-ceb73",
  storageBucket: "davat-ceb73.appspot.com",
  messagingSenderId: "841003551346",
  appId: "1:841003551346:web:728c5bbf5bb1274b8e10eb",
  measurementId: "G-LVXHZ33YES"
};
const settings: FirestoreSettings  = {
  // Example settings
  ignoreUndefinedProperties: true,
  cacheSizeBytes: 1048576,
  // useFetchStreams: false,
};

// Initialize Firebase
// export const provider = new firebase.auth.GoogleAuthProvider();
let app;

// if (!firebase?.length) {
  app = firebase.initializeApp(config);

// }
export const firebaseConfig =  app;
export const auth = getAuth(app);
// export const db = getFirestore(app);
export const db = initializeFirestore(app, settings);
// provider.setCustomParameters({
//   prompt: "select_account"
// });

// export const auth = firebaeeAuth.auth();
export const googleProvider = new GoogleAuthProvider();
