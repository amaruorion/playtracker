// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzllC3jlibwEJ2FX7YVgSXfUWyIARdJ5Q",
  authDomain: "playtracker-6490f.firebaseapp.com",
  databaseURL: "https://playtracker-6490f-default-rtdb.firebaseio.com",
  projectId: "playtracker-6490f",
  storageBucket: "playtracker-6490f.firebasestorage.app",
  messagingSenderId: "374367091123",
  appId: "1:374367091123:web:2de03c7fa586b89cd3f3c6",
  measurementId: "G-2F1BGQB4KQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database();
