import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { 
  LayoutDashboard, 
  UserCheck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  UserPlus, 
  ChevronRight,
  Bell
} from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Import de tes composants
import MedecinSettings from '../medecin/MedecinSettings';
import ReceptionDashboard from './ReceptionDashboard';
import PatientCheck from './PatientCheck';
import MedicalChat from './MedicalChat';
import AddPatient from './AddPatient';

const ReceptionLayout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialisation de navigate
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "utilisateurs", auth.currentUser.uid));
          if (userDoc.exists()) {
            setMustChangePassword(userDoc.data().mustChangePassword || false);
          }
        } catch (error) {
          console.error("Erreur de vérification du statut:", error);
        }
      }
      setLoading(false);
    };
    checkStatus();
  }, []);

  // Logique de déconnexion avec redirection
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Erreur déconnexion réception:", error);
    }
  };

  const menu = [
    { path: '/reception', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/reception/nouveau-patient', icon: UserPlus, label: 'Enregistrement' },
    { path: '/reception/admission', icon: UserCheck, label: 'Orientation' },
    { path: '/reception/messages', icon: MessageSquare, label: 'Messages Patients' },
    { path: '/reception/parametres', icon: Settings, label: 'Mon Compte' },
  ];

  const currentLabel = menu.find(m => m.path === location.pathname)?.label || "Tableau de bord";

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-blue-900 animate-pulse">Initialisation du portail...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* BARRE LATÉRALE (SIDEBAR) */}
      {!mustChangePassword && (
        <aside className="w-80 bg-[#004a99] text-white flex flex-col shadow-2xl relative z-10 transition-all duration-500">
          <div className="p-10 border-b border-white/5">
            <h1 className="text-2xl font-black tracking-tighter italic flex items-center gap-2">
              FirstAid <span className="text-green-400 not-italic">Hôpital</span>
            </h1>
            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-[0.2em] mt-1">Espace Réceptionniste</p>
          </div>

          <nav className="flex-1 p-6 space-y-3">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all duration-300 group ${
                    isActive 
                    ? 'bg-white text-[#004a99] shadow-xl translate-x-2' 
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={22} className={`${isActive ? 'text-[#004a99]' : 'text-white/40 group-hover:text-white'} transition-colors`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={18} className="animate-in fade-in slide-in-from-left-2" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-8 space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-blue-200/50 uppercase mb-2">Session active</p>
              <p className="text-sm font-bold truncate">{auth.currentUser?.email}</p>
            </div>
            {/* Mise à jour de l'appel onClick */}
            <button 
              onClick={handleLogout} 
              className="w-full p-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
              Déconnexion
            </button>
          </div>
        </aside>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
        {!mustChangePassword && (
          <header className="px-8 pt-8 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-[5] pb-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Portail Réception <span className="mx-2 text-gray-200">/</span> 
                <span className="text-blue-600">{currentLabel}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
          </header>
        )}

        <div className="p-8">
          {mustChangePassword ? (
            <div className="max-w-xl mx-auto mt-12 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-50 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Settings size={40} className="animate-spin-slow" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Sécurité requise</h2>
              <p className="text-gray-500 mb-10 font-medium leading-relaxed">
                Pour protéger les données des patients, vous devez définir un nouveau mot de passe personnel avant d'accéder aux fonctions d'enregistrement.
              </p>
              <MedecinSettings />
              {/* Optionnel : Ajout d'un bouton de sortie ici aussi pour plus de sécurité */}
              <button 
                onClick={handleLogout}
                className="mt-6 text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Quitter la session
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              <Routes>
                <Route path="/" element={<ReceptionDashboard />} />
                <Route path="/nouveau-patient" element={<AddPatient />} />
                <Route path="/admission" element={<PatientCheck />} />
                <Route path="/messages" element={<MedicalChat />} />
                <Route path="/parametres" element={<MedecinSettings />} />
              </Routes>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReceptionLayout;