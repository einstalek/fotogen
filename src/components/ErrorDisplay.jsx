// Add this to your PortraitGenerator.jsx or create a new component

import { auth, provider, signInWithPopup } from './firebase';
import { Link } from 'react-router-dom';

const ErrorDisplay = ({ error, clearError }) => {
  // Handle special error types
  if (error === 'auth_required') {
    const handleSignIn = async () => {
      try {
        await signInWithPopup(auth, provider);
        clearError(); // Clear the error once signed in
      } catch (loginError) {
        console.error("Login error:", loginError);
      }
    };

    return (
      <div className="bg-black/40 backdrop-blur-md border border-purple-500/50 text-white px-6 py-8 rounded-lg mb-8 text-center">
        <h3 className="text-xl font-semibold mb-3">Sign in Required</h3>
        <p className="mb-5 text-purple-200">You need to be signed in to generate portraits.</p>
        <button
          onClick={handleSignIn}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium shadow-lg transform transition hover:scale-105"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
  
  // Handle insufficient credits error (format: "credits_insufficient:required:current")
  if (error && error.startsWith('credits_insufficient:')) {
    const parts = error.split(':');
    const requiredCredits = parseInt(parts[1], 10);
    const currentCredits = parseInt(parts[2], 10);
    
    return (
      <div className="bg-black/40 backdrop-blur-md border border-purple-500/50 text-white px-6 py-8 rounded-lg mb-8 text-center">
        <h3 className="text-xl font-semibold mb-3">More Credits Needed</h3>
        <p className="mb-2 text-purple-200">
          This action requires {requiredCredits} credits, but you only have {currentCredits}.
        </p>
        <p className="mb-5 text-purple-300">
          Visit the donate page to get more credits.
        </p>
        <Link
          to="/donate"
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium shadow-lg transform transition hover:scale-105 inline-block"
        >
          Get More Credits
        </Link>
      </div>
    );
  }
  
  // Default error display
  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-8">
        {error}
      </div>
    );
  }
  
  return null;
};

export default ErrorDisplay;