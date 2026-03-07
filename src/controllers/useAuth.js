import { useState } from "react";
import { authService } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData); // Stocke l'utilisateur avec son rôle (admin ou medecin)
      return userData;
    } catch (error) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, handleLogin, loading };
};