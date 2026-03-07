import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// --- IMPORTATION DES VUES ---
import LoginPage from './views/auth/LoginPage';
import AdminLayout from './views/admin/AdminLayout'; 
import MedecinLayout from './views/medecin/MedecinLayout'; 
import ReceptionLayout from './views/reception/ReceptionLayout'; // <-- NOUVEAU

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "utilisateurs", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(firebaseUser);
            setRole(userDoc.data().role);
          } else {
            console.error("Profil Firestore manquant");
            setUser(null);
            setRole(null);
          }
        } catch (error) {
          console.error("Erreur d'accès Firestore:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fonction utilitaire pour gérer les directions de redirection
  const getRedirectPath = (userRole) => {
    switch(userRole) {
      case 'admin': return "/admin";
      case 'medecin': return "/medecin";
      case 'reception': return "/reception"; // <-- DIRECTION RÉCEPTION
      default: return "/login";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-t-[#28a745] border-r-[#0056b3] rounded-full animate-spin absolute top-0"></div>
        </div>
        <h2 className="mt-6 text-xl font-black text-[#0056b3] tracking-tighter uppercase">
          FirstAid <span className="text-[#28a745]">Loum</span>
        </h2>
        <p className="text-gray-400 text-xs font-bold mt-2 animate-pulse tracking-widest">SÉCURISATION DU PORTAIL...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* LOGIN : Redirige vers le bon espace si déjà connecté */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to={getRedirectPath(role)} replace />} 
        />

        {/* ESPACE ADMINISTRATEUR */}
        <Route 
          path="/admin/*" 
          element={user && role === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />} 
        />

        {/* ESPACE MÉDECIN NEUROLOGUE */}
        <Route 
          path="/medecin/*" 
          element={user && role === 'medecin' ? <MedecinLayout /> : <Navigate to="/login" replace />} 
        />

        {/* ESPACE RÉCEPTION / ACCUEIL */}
        <Route 
          path="/reception/*" 
          element={user && role === 'reception' ? <ReceptionLayout /> : <Navigate to="/login" replace />} 
        />

        {/* PROTECTION GLOBALE */}
        <Route 
          path="*" 
          element={<Navigate to={user ? getRedirectPath(role) : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;