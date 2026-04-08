import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// --- IMPORTATION DES VUES ---
import LoginPage from './views/auth/LoginPage';
import AdminLayout from './views/admin/AdminLayout'; 
import MedecinLayout from './views/medecin/MedecinLayout'; 
import ReceptionLayout from './views/reception/ReceptionLayout'; 

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
            // On s'assure de récupérer le champ 'role' ou 'rôle' selon ta base
            const userData = userDoc.data();
            setRole(userData.role || userData.rôle); 
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

  // Utilitaire de redirection selon le rôle
  const getRedirectPath = (userRole) => {
    switch(userRole) {
      case 'admin': return "/admin";
      case 'medecin': return "/medecin";
      case 'reception': return "/reception";
      default: return "/login";
    }
  };

  // Écran de chargement "Professionnel" (sobre, gris et bleu)
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Spinner sobre */}
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-t-blue-600 border-r-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
              FirstAid <span className="text-blue-600">Loum</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em] animate-pulse">
              Initialisation du terminal sécurisé
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* LOGIN : Redirige automatiquement si déjà authentifié */}
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

        {/* ROUTE PAR DÉFAUT : Sécurité & Redirection dynamique */}
        <Route 
          path="*" 
          element={<Navigate to={user ? getRedirectPath(role) : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;