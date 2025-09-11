// src/components/newInvoice.jsx
import React, { useState } from 'react';

const NewInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    client: '',
    invoiceDate: '',
    amount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Invoice Data:', invoiceData);
    // You can call an API here to save the invoice
  };

  return (
    <div className="new-invoice-form">
      <h2>Create New Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Invoice Number:</label>
          <input
            type="text"
            name="invoiceNumber"
            value={invoiceData.invoiceNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Client:</label>
          <input
            type="text"
            name="client"
            value={invoiceData.client}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Invoice Date:</label>
          <input
            type="date"
            name="invoiceDate"
            value={invoiceData.invoiceDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={invoiceData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
};

export default NewInvoice;
