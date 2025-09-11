import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user is logged in (for example, check if the token is in localStorage)
  const isAuthenticated = localStorage.getItem("authToken"); // Adjust this condition based on your login logic

  if (!isAuthenticated) {
    // Redirect them to the login page if not authenticated
    return <Navigate to="/login-page" />;
  }

  // If authenticated, render the children (protected route)
  return children;
};

export default ProtectedRoute;
