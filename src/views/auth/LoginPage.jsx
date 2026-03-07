import React, { useState } from 'react';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Authentification
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Vérification du rôle dans Firestore
      const userDoc = await getDoc(doc(db, "utilisateurs", user.uid));

      if (userDoc.exists()) {
        const role = userDoc.data().role;
        // La redirection se fera via App.jsx grâce à l'écouteur onAuthStateChanged
        // Mais on peut forcer ici pour la rapidité
        if (role === 'admin') navigate('/admin');
        else if (role === 'medecin') navigate('/medecin');
      } else {
        setError("Accès refusé : Aucun profil trouvé pour ce compte.");
        await auth.signOut(); // On déconnecte car le profil Firestore est manquant
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      
      {/* SECTION GAUCHE : IDENTITÉ VISUELLE */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0056b3] flex-col items-center justify-center p-12 text-white relative">
        {/* Décoration en arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-40 h-40 bg-[#28a745] rounded-full flex items-center justify-center border-8 border-white shadow-2xl animate-bounce-slow">
            <Plus size={100} color="white" strokeWidth={4} />
          </div>
          
          <h1 className="mt-8 text-5xl font-black tracking-tighter italic">
            FirstAid <span className="text-[#28a745]">Loum</span>
          </h1>
          
          <div className="mt-10 text-center space-y-2">
            <div className="h-1 w-24 bg-[#28a745] mx-auto rounded-full mb-4"></div>
            <p className="text-2xl font-light uppercase tracking-[0.2em]">Institution</p>
            <p className="text-xl font-bold">Hôpital de District de Loum</p>
            <p className="text-sm opacity-70">Ministère de la Santé Publique - Cameroun</p>
          </div>
        </div>
      </div>

      {/* SECTION DROITE : FORMULAIRE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#f8fafc]">
        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-900/5">
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-extrabold text-[#0056b3]">Accès Personnel</h2>
            <p className="text-gray-400 mt-2 font-medium">Portail de gestion des patients épileptiques</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Identifiant Email
              </label>
              <input 
                type="email" 
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745] focus:outline-none transition-all placeholder:text-gray-300 font-medium"
                placeholder="ex: medecin@loum.cm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Mot de passe
              </label>
              <input 
                type="password" 
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745] focus:outline-none transition-all placeholder:text-gray-300 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-lg ${
                loading ? 'bg-gray-400' : 'bg-[#28a745] hover:bg-[#218838] hover:shadow-green-200 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} /> Vérification...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          <footer className="mt-12 text-center text-gray-300 text-[10px] font-bold tracking-widest">
            <p>© 2026 FIRSTAID LOUM - BTS SOUTENANCE</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;