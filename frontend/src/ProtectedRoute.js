import React from "react";
import { Route, Navigate } from "react-router-dom";

// Composant pour les routes protégées
const ProtectedRoute = ({ element, ...rest }) => {
  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = localStorage.getItem("token");

  // Si l'utilisateur est connecté, afficher le composant
  // Sinon, rediriger vers la page de connexion
  return isAuthenticated ? (
    <Route {...rest} element={element} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
