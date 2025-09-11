import React from 'react'
import { useState } from 'react'
import './App.css'
import ViewInvoices from './components/ViewInvoices'
import InvoiceForm from './components/InvoiceForm'
import LoginPage from './components/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';


function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
         <Route path="/login-page" element={<LoginPage />} />
        <Route path="/" element={<ViewInvoices />} />
        <Route path="/view-invoice" element={<ViewInvoices />} />
        <Route path="/invoice-form" element={<InvoiceForm />} />

        {/* <Route path="/" element={<ProtectedRoute><ViewInvoices /></ProtectedRoute>} />
        <Route path="/view-invoice" element={<ProtectedRoute><ViewInvoices /></ProtectedRoute>} />
        <Route path="/invoice-form" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} /> */}
       
        {/* Add other routes here */}
      </Routes>
    </Router>
  )
}

export default App
