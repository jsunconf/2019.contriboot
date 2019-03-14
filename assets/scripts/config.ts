import firebase from 'firebase/app';
require("firebase/auth");
require("firebase/database");

var config = {
    apiKey: "AIzaSyC1jra7dTbD9uOM56gBgwLdbMxg5b1CUvo",
    authDomain: "contriboot-2019.firebaseapp.com",
    databaseURL: "https://contriboot-2019.firebaseio.com",
    projectId: "contriboot-2019",
    storageBucket: "contriboot-2019.appspot.com",
    messagingSenderId: "464729946262"
  };
firebase.initializeApp(config);

export const CONTRIBUTIONS_DB = 'contributions';
export const INTERESTS_DB= 'interests';
export const VOTES_DB = 'votes';

export default firebase;
