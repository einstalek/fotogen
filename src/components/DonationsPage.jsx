import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import React, { useState, useEffect } from 'react';
import { Heart, Coffee, DollarSign, Coins, CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import { useAuth } from '../components/AuthContext';
import { doc, updateDoc, increment, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../components/firebase';
import { useLocation } from 'react-router-dom';

// Fix for Stripe key loading
// In Vite, environment variables need to be prefixed with VITE_
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
// console.log('Stripe key status:', stripeKey ? 'Found' : 'Not found');

let backendURI;
if (import.meta.env.DEV) {
  backendURI = import.meta.env.VITE_BACKEND_URI;
} 
else {
  backendURI = '';  // Empty string for relative paths
}

let singleRunCost;
  if (import.meta.env.DEV) {
    singleRunCost = import.meta.env.VITE_SINGLE_RUN_CREDITS;
  } 
  else {
    singleRunCost = 30;
}

// Only initialize Stripe if we have a key
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const DonationsPageWithStripe = () => {
  // Show error if no stripe key is available
  if (!stripePromise) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <section className="py-10 md:py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Heart className="mx-auto h-16 w-16 text-pink-500 mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Support This Project
              </h1>
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
                <p className="text-white">Stripe configuration error. Please check your environment variables.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonationsPage />
    </Elements>
  );
};

// Tiered credit calculation function with better value at higher tiers
const calculateCredits = (amount) => {
  // Base conversion rate: $1 = 100 credits
  const baseRate = 100;
  let bonusPercentage = 0;
  
  // Set bonus percentage based on donation amount
  if (amount < 2) {
    bonusPercentage = 0;
  } else if (amount < 5) {
    bonusPercentage = 5;
  } else if (amount < 10) {
    bonusPercentage = 10;
  } else if (amount < 15) {
    bonusPercentage = 15;
  } else if (amount < 20) {
    bonusPercentage = 20;
  } else {
    bonusPercentage = 20;
  }
  
  // Calculate credits with bonus
  const credits = Math.floor(amount * baseRate * (1 + bonusPercentage / 100));
  
  return credits;
};

// Calculate cost per portrait
const calculateCostPerPortrait = (amount) => {
  const credits = calculateCredits(amount);
  const portraits = Math.floor(credits / singleRunCost);
  return (amount / portraits).toFixed(2);
};

const DonationsPage = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { user, credits, refreshCredits } = useAuth();
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addedCredits, setAddedCredits] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  
  // Check URL parameters for payment status
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const paymentIntent = queryParams.get('payment_intent');
    const error = queryParams.get('error');
    
    if (success === 'true' && paymentIntent) {
      // Payment was successful after 3D Secure
      setShowThankYou(true);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, '/donate');
      
      // Get the amount from local storage
      const storedAmount = localStorage.getItem('lastDonationAmount');
      if (storedAmount) {
        const amount = parseFloat(storedAmount);
        const calculatedCredits = calculateCredits(amount);
        setAddedCredits(calculatedCredits);
        localStorage.removeItem('lastDonationAmount');
        
        // Refresh user credits to show updated balance
        if (user && refreshCredits) {
          refreshCredits();
        }
      }
    } else if (success === 'false') {
      // Payment failed after 3D Secure
      setErrorMessage(error || 'Payment was not completed successfully');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, '/donate');
    }
  }, [location, user, refreshCredits]);
  
  // Function to handle 3D Secure redirect
  const handleRedirect = (redirectUrl) => {
    setIsRedirecting(true);
    
    // Store the amount in localStorage for when user returns
    const amount = parseFloat(donationAmount || customAmount);
    localStorage.setItem('lastDonationAmount', amount.toString());
    
    // Redirect the user to the 3D Secure page
    window.location.href = redirectUrl;
  };
  
  const handleDonation = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setErrorMessage("Stripe hasn't loaded yet. Please try again.");
      return;
    }
  
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Get the amount in cents for Stripe
      const amount = parseFloat(donationAmount || customAmount);
      
      // Create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
  
      if (error) {
        setErrorMessage(error.message);
      } else {
        // Send payment to server
        try {
          const response = await fetch(`${backendURI}/api/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentMethodId: paymentMethod.id,
              amount: amount,
              userId: user?.uid || null
            }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Payment successful without 3D Secure
            if (result.addedCredits) {
              setAddedCredits(result.addedCredits);
            } else {
              setAddedCredits(calculateCredits(amount));
            }
            
            // Refresh user credits to show updated balance
            if (user && refreshCredits) {
              refreshCredits();
            }
            
            setShowThankYou(true);
          } else if (result.requires_action && result.redirect_url) {
            // Payment requires 3D Secure authentication
            handleRedirect(result.redirect_url);
            return; // Exit early since we're redirecting
          } else {
            setErrorMessage(result.error || 'Payment failed. Please try again.');
          }
        } catch (fetchError) {
          console.error('Server request failed:', fetchError);
          setErrorMessage('Could not connect to payment server. Please try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      if (!isRedirecting) {
        setIsProcessing(false);
      }
    }
  };

  const predefinedAmounts = [2, 5, 10, 20];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="py-10 md:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Heart className="mx-auto h-16 w-16 text-pink-500 mb-4" />
              <h1 className="text-4xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {t.supportTitle || "Support This Project"}
              </h1>
              {user && (
                <p className="text-lg text-purple-200 mb-6">
                  Your current credits: <span className="font-bold text-white">{credits || 0}</span>
                </p>
              )}              
            </div>

            {isRedirecting ? (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 md:p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
                <h3 className="text-xl font-medium text-white mb-2">Redirecting to secure payment...</h3>
                <p className="text-purple-200">Please do not close this window.</p>
              </div>
            ) : showThankYou ? (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/50 rounded-lg p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Thank You For Your Support!</h3>
                {user && addedCredits > 0 && (
                  <p className="text-lg font-medium text-green-300 mb-2">
                    {addedCredits} credits have been added to your account!
                    <br/>
                    {/* <span className="text-sm">(Approximately {Math.floor(addedCredits / singleRunCost)} portraits)</span> */}
                  </p>
                )}
                {/* <p className="text-purple-200">Your contribution helps us continue to develop and improve our AI portrait service.</p> */}
                {/* <button
                  onClick={() => window.location.reload()}
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                >
                  Make Another Donation
                </button> */}
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 md:p-8">
                <form onSubmit={handleDonation}>
                  <div className="mb-6">
                    <label className="block text-white text-lg font-medium mb-4">Choose an amount</label>
                    
                    {/* Pricing tiers with better visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      {predefinedAmounts.map((amount) => {
                        const tier = amount >= 20 ? 'premium' : amount >= 10 ? 'high' : amount >= 5 ? 'mid' : 'base';
                        const credits = calculateCredits(amount);
                        const portraits = Math.floor(credits / singleRunCost);
                        const costPerPortrait = calculateCostPerPortrait(amount);
                        const bonusPercentage = 
                          tier === 'premium' ? '20%' : 
                          tier === 'high' ? '10%' : 
                          tier === 'mid' ? '5%' : '';
                        
                        return (
                          <button
                            key={amount}
                            type="button"
                            className={`py-4 px-4 rounded-md flex flex-col items-center justify-center transition-all ${
                              donationAmount === amount 
                                ? tier === 'premium' ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 text-white font-bold'
                                : tier === 'high' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold'
                                : tier === 'mid' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold'
                                : 'bg-purple-600 text-white font-bold'
                                : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105'
                            }`}
                            onClick={() => {
                              setDonationAmount(amount);
                              setCustomAmount('');
                            }}
                          >
                            <div className="flex items-center mb-2">
                              <DollarSign className="mr-1 h-4 w-4" />
                              <span className="text-lg font-bold">{amount}</span>
                            </div>
                            
                            <div className="text-sm text-purple-200 mb-1">
                              {credits} credits
                            </div>
                            
                            <div className="text-xs">
                              ${costPerPortrait}/portrait
                            </div>
                            
                            {bonusPercentage && (
                              <div className="mt-2 flex items-center bg-purple-500/30 px-2 py-1 rounded-full text-xs">
                                <Sparkles size={10} className="mr-1" />
                                +{bonusPercentage} bonus
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-white font-medium mb-2">Custom amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setDonationAmount('');
                          }}
                          placeholder="Enter amount"
                          className="bg-white/10 border border-white/20 text-white rounded-md py-3 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="1"
                          step="0.01"
                        />
                      </div>
                      
                      {/* Credit calculation display - fixed alignment */}
                      {customAmount && parseFloat(customAmount) >= 1 && (
                        <div className="mt-3 px-1 text-purple-300">
                          <p className="text-sm">You'll receive {calculateCredits(parseFloat(customAmount))} credits</p>
                          <p className="text-sm">${calculateCostPerPortrait(parseFloat(customAmount))}/portrait</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">Card Details</label>
                    <div className="bg-white/10 border border-white/20 rounded-md p-4">
                      <CardElement options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#FFFFFF',
                            '::placeholder': {
                              color: '#AAAAAA',
                            },
                          },
                        },
                      }} />
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-white">
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={!stripe || !elements || isProcessing || (!donationAmount && !customAmount) || (customAmount && parseFloat(customAmount) < 1)}
                      className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-md shadow-lg transform transition-all ${
                        (!stripe || !elements || isProcessing || (!donationAmount && !customAmount) || (customAmount && parseFloat(customAmount) < 1)) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:translate-y-px'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : user ? 'Donate & Get Credits' : 'Donate Now'}
                    </button>
                  </div>
                  
                  {!user && (
                    <div className="mt-4 text-center text-sm text-purple-300">
                      <p>Sign in to receive credits with your donation!</p>
                    </div>
                  )}
                </form>
              </div>
            )}
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">        
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all text-center">
                <Coins className="mx-auto h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Value Tiers
                </h3>
                <p className="text-purple-200">
                  Higher donations give you bonus credits!<br/>
                  <span className="text-xs mt-1 block">$20 donation = 10% extra credits</span>
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all text-center">
                <DollarSign className="mx-auto h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Fair Pricing
                </h3>
                <p className="text-purple-200">
                  {singleRunCost} credits per portrait<br/>
                  <span className="text-xs mt-1 block">As low as $0.68 per portrait with premium tier</span>
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all text-center">
                <Heart className="mx-auto h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Growth & Support
                </h3>
                <p className="text-purple-200">
                  Your donations help us improve the service and add new features!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DonationsPageWithStripe;