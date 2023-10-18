import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBzhzsIM9nqkV8jngX_r6xJVc1JY1TzOGk",
    authDomain: "blog-tanayvan-com.firebaseapp.com",
    projectId: "blog-tanayvan-com",
    storageBucket: "blog-tanayvan-com.appspot.com",
    messagingSenderId: "1070345993250",
    appId: "1:1070345993250:web:d3b1229311a94a78165e7b",
    measurementId: "G-S2CWHVFV87"
};


// Initialize Firebase

let firebase = initializeApp(firebaseConfig);

export { firebase };
