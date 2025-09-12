import React from 'react'
import { useState, useEffect } from 'react'
import './App.css'
import ViewInvoices from './components/ViewInvoices'
import InvoiceForm from './components/InvoiceForm'
import LoginPage from './components/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import axios from "./utils/secureAxios";

function App() {
   const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isEmbedded, setIsEmbedded] = useState(false);

  // Add to your main component
  useEffect(() => {
    const handleMessage = (event) => {
      // Check origin for security
      if (event.origin !== 'https://tasks.sharda.co.in') return;
      
      if (event.data.type === 'authToken' && event.data.token) {
        localStorage.setItem('authToken', event.data.token);
        setToken(event.data.token);
        setIsEmbedded(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${event.data.token}`;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Router>
      <Routes>
         <Route path="/login-page" element={<LoginPage />} />
        {/* <Route path="/" element={<ViewInvoices />} />
        <Route path="/view-invoice" element={<ViewInvoices />} />
        <Route path="/invoice-form" element={<InvoiceForm />} /> */}

        <Route path="/" element={<ProtectedRoute><ViewInvoices /></ProtectedRoute>} />
        <Route path="/view-invoice" element={<ProtectedRoute><ViewInvoices /></ProtectedRoute>} />
        <Route path="/invoice-form" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
       
        {/* Add other routes here */}
      </Routes>
    </Router>
  )
}

export default App
