import {User} from 'firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import {SetStateAction, useCallback, useEffect, useState} from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import './App.css';
import {AppContext, AppContextType} from './Context';
import Home from './Home';
import LoadingOverlay from './LoadingOverlay';

const firebaseConfig = {
  apiKey: "AIzaSyAKHNAQjtGSIyITCW9w2y7YCeUp_uMTqs8",
  authDomain: "auto-insta-post-1811e.firebaseapp.com",
  projectId: "auto-insta-post-1811e",
  storageBucket: "auto-insta-post-1811e.appspot.com",
  messagingSenderId: "1067563324915",
  appId: "1:1067563324915:web:17157ccdd2740c9f11ae86"
};
firebase.initializeApp(firebaseConfig);

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
};

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    setIsLoading(true);
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user as SetStateAction<User | null>);
      setIsLoading(false);
    })
  }, []);

  const lockScroll = useCallback(() => {
    document.body.style.overflow = 'hidden';
  }, [])

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
  }, [])

  useEffect(() => {
    if (isLoading) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [isLoading, lockScroll, unlockScroll]);

  if (user === null) {
    return (
      <AppContext.Provider value={{isLoading} as AppContextType}>
        <div className='app'>
          <div className='content'>
            <LoadingOverlay />
            <h1>Auto Instagram Poster</h1>
            <h2>Admin App</h2>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
          </div>
        </div>
      </AppContext.Provider>
    )
  }

  const appContext: AppContextType = {
    user,
    isLoading,
    setIsLoading
  }

  return (
    <AppContext.Provider value={appContext}>
      <Home />
    </AppContext.Provider>
  )
}

export default App
