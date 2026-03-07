// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCeZzPuSYh-qZ8KpEO3utoqgbu8XCAl15I",
    authDomain: "loum-epilepsie.firebaseapp.com",
    projectId: "loum-epilepsie",
    storageBucket: "loum-epilepsie.firebasestorage.app",
    messagingSenderId: "745360660470",
    appId: "1:745360660470:web:f1b773eb416715620659d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);