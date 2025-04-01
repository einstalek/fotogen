import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { Heart, Coffee, DollarSign, Coins, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';

// Fix for Stripe key loading
// In Vite, environment variables need to be prefixed with VITE_
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe key status:', stripeKey ? 'Found' : 'Not found');

let backendURI;
  if (import.meta.env.DEV) {
    backendURI = import.meta.env.VITE_BACKEND_URI;
  } 
  else {
    backendURI = '';  // Empty string for relative paths
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
        <Footer />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonationsPage />
    </Elements>
  );
};

const DonationsPage = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const stripe = useStripe();
  const elements = useElements();
  
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
              amount: amount
            }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            setShowThankYou(true);
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
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [1, 5, 10, 20];

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
            </div>

            {showThankYou ? (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/50 rounded-lg p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Thank You For Your Support!</h3>
                <p className="text-purple-200">Your contribution helps us continue to develop and improve our AI portrait service.</p>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 md:p-8">
                <form onSubmit={handleDonation}>
                  <div className="mb-6">
                    <label className="block text-white text-lg font-medium mb-4">Choose an amount</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {predefinedAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          className={`py-3 px-4 rounded-md flex items-center justify-center transition-all ${
                            donationAmount === amount 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold' 
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                          onClick={() => {
                            setDonationAmount(amount);
                            setCustomAmount('');
                          }}
                        >
                          <DollarSign className="mr-1 h-4 w-4" />
                          {amount}
                        </button>
                      ))}
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
                        />
                      </div>
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
                      disabled={!stripe || !elements || isProcessing || (!donationAmount && !customAmount)}
                      className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-md shadow-lg transform transition-all ${
                        (!stripe || !elements || isProcessing || (!donationAmount && !customAmount)) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:translate-y-px'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : 'Donate Now'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">        
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all text-center">
                <DollarSign className="mx-auto h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Sponsor Features
                </h3>
                <p className="text-purple-200">
                  Donations help developing new features and portrait styles.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all text-center">
                <Coins className="mx-auto h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Support Growth
                </h3>
                <p className="text-purple-200">
                  Your contributions help improving portraits quality and add more service options.
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