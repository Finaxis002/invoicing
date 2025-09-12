// import React from 'react'
// import { useState, useEffect } from 'react'
// import './App.css'
// import ViewInvoices from './components/ViewInvoices'
// import InvoiceForm from './components/InvoiceForm'
// import LoginPage from './components/LoginPage'
// import ProtectedRoute from './components/ProtectedRoute'
// import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
// import axios from "./utils/secureAxios";

// function App() {
//    const [token, setToken] = useState(localStorage.getItem('authToken'));
//   const [isEmbedded, setIsEmbedded] = useState(false);

//   // Add to your main component
//   useEffect(() => {
//     const handleMessage = (event) => {
//       // Check origin for security
//       if (event.origin !== 'https://tasks.sharda.co.in') return;
      
//       if (event.data.type === 'authToken' && event.data.token) {
//         localStorage.setItem('authToken', event.data.token);
//         setToken(event.data.token);
//         setIsEmbedded(true);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${event.data.token}`;
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   useEffect(() => {
//   // Check for token passed from task management
//   const checkForPassedToken = () => {
//     const token = localStorage.getItem('invoiceAuthToken');
//     const timestamp = localStorage.getItem('tokenTimestamp');
    
//     // Check if token was set recently (within last 5 seconds)
//     if (token && timestamp && (Date.now() - parseInt(timestamp)) < 5000) {
//       localStorage.setItem('authToken', token);
      
//       // Clean up
//       localStorage.removeItem('invoiceAuthToken');
//       localStorage.removeItem('tokenTimestamp');
      
//       setToken(token);
//       console.log('Token received from task management app');
//     }
//   };

//   checkForPassedToken();
// }, []);

//   return (
//     <Router>
//       <Routes>
//          <Route path="/login-page" element={<LoginPage />} />
//         {/* <Route path="/" element={<ViewInvoices />} />
//         <Route path="/view-invoice" element={<ViewInvoices />} />
//         <Route path="/invoice-form" element={<InvoiceForm />} /> */}

//         <Route path="/" element={<ProtectedRoute><ViewInvoices /></ProtectedRoute>} />
//         <Route path="/view-invoice" element={<ProtectedRoute><ViewInvoices /></ProtectedRoute>} />
//         <Route path="/invoice-form" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
       
//         {/* Add other routes here */}
//       </Routes>
//     </Router>
//   )
// }

// export default App
















/////////////////////////////////////////////////////////////////////////////////


import React, { useState, useEffect } from 'react';
import './App.css';
import ViewInvoices from './components/ViewInvoices';
import InvoiceForm from './components/InvoiceForm';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true); // Add loading state

  // Check for token passed from task management - MUST happen before routing
  useEffect(() => {
    const checkForPassedToken = () => {
      console.log("Checking for passed token...");
      
      // Method 1: Check localStorage for token passed from task management
      const passedToken = localStorage.getItem('invoiceAuthToken');
      const timestamp = localStorage.getItem('tokenTimestamp');
      
      // Check if token was set recently (within last 10 seconds)
      if (passedToken && timestamp && (Date.now() - parseInt(timestamp)) < 10000) {
        console.log("Token found in localStorage from task management");
        localStorage.setItem('authToken', passedToken);
        
        // Clean up
        localStorage.removeItem('invoiceAuthToken');
        localStorage.removeItem('tokenTimestamp');
        
        setToken(passedToken);
        setIsEmbedded(true);
        setIsCheckingToken(false);
        return;
      }
      
      // Method 2: Check URL parameters (alternative approach)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        console.log("Token found in URL parameters");
        localStorage.setItem('authToken', urlToken);
        setToken(urlToken);
        setIsEmbedded(true);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsCheckingToken(false);
        return;
      }
      
      // Method 3: Listen for postMessage from opener
      const handleMessage = (event) => {
        if (event.origin !== 'https://tasks.sharda.co.in') return;
        
        if (event.data.type === 'authToken' && event.data.token) {
          console.log("Token received via postMessage");
          localStorage.setItem('authToken', event.data.token);
          setToken(event.data.token);
          setIsEmbedded(true);
          setIsCheckingToken(false);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // If no token found after delay, proceed without it
      const timeout = setTimeout(() => {
        console.log("No token found, proceeding to normal flow");
        setIsCheckingToken(false);
        window.removeEventListener('message', handleMessage);
      }, 2000); // Wait 2 seconds for token

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
      };
    };

    checkForPassedToken();
  }, []);

  // Show loading spinner while checking for token
  if (isCheckingToken) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>Connecting to task management system...</p>
        <style>
          {`@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`}
        </style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login-page" element={<LoginPage />} />
        
        {/* Protected routes - will redirect to login if no token */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ViewInvoices />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/view-invoice" 
          element={
            <ProtectedRoute>
              <ViewInvoices />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/invoice-form" 
          element={
            <ProtectedRoute>
              <InvoiceForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;