import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDXfk7H-3ERCTIbyxUKD7Zm_BGk1jRqfuk",
    authDomain: "privateprofileproject.firebaseapp.com",
    databaseURL: "https://privateprofileproject.firebaseio.com",
    projectId: "privateprofileproject",
    storageBucket: "privateprofileproject.appspot.com",
    messagingSenderId: "863065105024",
    appId: "1:863065105024:web:b0a9f412dbf60a9bff3c65"
};

// Initialize Firebase
export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

