import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, UserCheck, MessageSquare, 
  Settings, LogOut, UserPlus, ChevronRight,
  Bell, CalendarClock, AlertCircle, X 
} from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Tes composants
import MedecinSettings from '../medecin/MedecinSettings';
import ReceptionDashboard from './ReceptionDashboard';
import PatientCheck from './PatientCheck';
import MedicalChat from './MedicalChat';
import AddPatient from './AddPatient';
import AjoutRendezVous from './AjoutRendezVous'; // <-- NOUVEAU

const ReceptionLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ÉTAT POUR LA MODALE DE DÉCONNEXION
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  const menu = [
    { path: '/reception', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/reception/nouveau-patient', icon: UserPlus, label: 'Enregistrement' },
    { path: '/reception/rendez-vous', icon: CalendarClock, label: 'Rendez-vous' }, // AJOUTÉ
    { path: '/reception/admission', icon: UserCheck, label: 'Orientation' },
    { path: '/reception/messages', icon: MessageSquare, label: 'Messages Patients' },
    { path: '/reception/parametres', icon: Settings, label: 'Mon Compte' },
  ];

  const currentLabel = menu.find(m => m.path === location.pathname)?.label || "Tableau de bord";

  if (loading) return <div className="h-screen flex items-center justify-center">Initialisation...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* MODALE DE CONFIRMATION DE DÉCONNEXION */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Déconnexion ?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Êtes-vous sûr de vouloir quitter votre session de travail ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout}
                className="py-3 px-6 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
              >
                Oui, Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      {!mustChangePassword && (
        <aside className="w-80 bg-[#004a99] text-white flex flex-col shadow-2xl relative z-10">
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
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all group ${
                    isActive ? 'bg-white text-[#004a99] shadow-xl translate-x-2' : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={22} className={isActive ? 'text-[#004a99]' : 'text-white/40 group-hover:text-white'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={18} />}
                </Link>
              );
            })}
          </nav>

          <div className="p-8 space-y-4">
            <button 
              onClick={() => setShowLogoutModal(true)} // APPEL DE LA MODALE
              className="w-full p-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
              Déconnexion
            </button>
          </div>
        </aside>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {!mustChangePassword && (
          <header className="px-8 pt-8 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-[5] pb-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Portail Réception <span className="mx-2 text-gray-200">/</span> 
                <span className="text-blue-600">{currentLabel}</span>
              </span>
            </div>
          </header>
        )}

        <div className="p-8">
          <Routes>
            <Route path="/" element={<ReceptionDashboard />} />
            <Route path="/nouveau-patient" element={<AddPatient />} />
            <Route path="/rendez-vous" element={<AjoutRendezVous />} /> {/* ROUTE AJOUTÉE */}
            <Route path="/admission" element={<PatientCheck />} />
            <Route path="/messages" element={<MedicalChat />} />
            <Route path="/parametres" element={<MedecinSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default ReceptionLayout;