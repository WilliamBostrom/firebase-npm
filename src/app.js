// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDf1ByRUpI2CjNZKOD28qY2-QRDkeegrjc",
  authDomain: "fir-project-6df75.firebaseapp.com",
  projectId: "fir-project-6df75",
  storageBucket: "fir-project-6df75.appspot.com",
  messagingSenderId: "164561661845",
  appId: "1:164561661845:web:ec6ce9f34e781dce7d109c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
