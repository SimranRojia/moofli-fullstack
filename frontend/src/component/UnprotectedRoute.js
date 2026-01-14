import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ⬅️ 1. Use 'useUser' from your context file

const UnprotectedRoute = ({ children }) => {
  const { user, loading } = useUser(); // ⬅️ 2. Get the new 'loading' state

  // 3. Wait until the user check is complete
  if (loading) {
    // You can return a full-page loader here if you have one,
    // or null for a blank screen
    return null;
  }

  // 4. If check is done and user EXISTS, redirect to homepage
  if (user) {
    return <Navigate to="/homepage" replace />; // ⬅️ 5. Changed path to '/homepage'
  }

  // 6. If check is done and NO user, show the children (Login or Landing page)
  return children;
};

export default UnprotectedRoute;