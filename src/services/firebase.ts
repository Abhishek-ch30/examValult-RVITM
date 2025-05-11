
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyCpo2rBiooSzUYmO1p8IH71n1gN0bCny2A",
  authDomain: "examvaultrvitm.firebaseapp.com",
  projectId: "examvaultrvitm",
  storageBucket: "examvaultrvitm.firebasestorage.app",
  messagingSenderId: "1037976893929",
  appId: "1:1037976893929:web:ac35f74ba4b212547d3378",
  measurementId: "G-P3LNZTM8TQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    
    // Handle the unauthorized domain error gracefully
    if (error.code === 'auth/unauthorized-domain') {
      toast.error("Google login is not available on this domain. Using mock login instead.");
      
      // Create a mock user for testing purposes
      return {
        uid: 'mock-uid-' + Date.now(),
        email: 'mockuser@example.com',
        displayName: 'Mock User',
        photoURL: null,
        emailVerified: true,
      };
    }
    throw error;
  }
};
