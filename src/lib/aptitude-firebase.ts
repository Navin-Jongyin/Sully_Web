import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const aptitudeApp = getApps().some((app) => app.name === 'aptitude-game')
  ? getApp('aptitude-game')
  : initializeApp(
  {
    apiKey: 'AIzaSyAfwwfAyhkUErLOtKz1k8Dqdy59DfxcT4s',
    authDomain: 'apptitude-game.firebaseapp.com',
    projectId: 'apptitude-game',
    storageBucket: 'apptitude-game.firebasestorage.app',
    messagingSenderId: '792927206814',
    appId: '1:792927206814:web:795c6cb93099930dc42a8f',
  },
  'aptitude-game',
);

export const aptitudeDb = getFirestore(aptitudeApp);
