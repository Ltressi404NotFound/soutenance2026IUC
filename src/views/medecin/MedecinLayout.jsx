import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardList, Settings, 
  LogOut, ShieldAlert, Calendar, MessageSquare
} from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Importations des sous-vues
import MedecinDashboard from "./MedecinDashboard";
import MedecinSettings from "./MedecinSettings";
import ConsultationRoom from "./ConsultationRoom";
import MesPatients from "./MesPatients";
import RendezVous from "./RendezVous";

const MedecinLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "utilisateurs", auth.currentUser.uid));
          if (userDoc.exists()) {
            setMustChangePassword(userDoc.data().mustChangePassword || false);
          }
        } catch (error) {
          console.error("Erreur vérification statut:", error);
        }
      }
      setLoading(false);
    };
    checkUserStatus();
  }, [location.pathname]);

  const handleLogout = () => signOut(auth).then(() => {
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true });
  });

  // Menu mis à jour pour correspondre aux besoins du médecin
  const menuItems = [
    { path: '/medecin', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/medecin/patients', icon: Users, label: 'Mes Patients' },
    { path: '/medecin/rendez-vous', icon: Calendar, label: 'Rendez-vous' },
    { path: '/medecin/consultations', icon: ClipboardList, label: 'Consultations' },
    { path: '/medecin/parametres', icon: Settings, label: 'Mon compte' },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#00469b]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR - Style Bleu Foncé (Identique à l'image Réception) */}
      {!mustChangePassword && (
        <aside className="w-72 bg-[#00469b] flex flex-col h-full shadow-xl z-20">
          
          {/* HEADER SECTION (Style de l'image) */}
          <div className="p-8 mb-6">
            <h1 className="text-white text-2xl font-black tracking-tighter leading-tight italic">
              PREMIERS <br /> SECOURS
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#34d399] font-bold text-lg italic">Médecin</span>
              <span className="h-[2px] w-8 bg-[#34d399]/30"></span>
            </div>
            <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-4">
              Espace Consultation
            </p>
          </div>

          {/* MENU ITEMS */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-sm transition-all relative overflow-hidden group ${
                    isActive 
                    ? 'bg-white text-[#00469b] shadow-lg translate-x-2' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#34d399]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* LOGOUT BUTTON (Encadré en rouge comme sur l'image) */}
          <div className="p-6">
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-rose-500/30 bg-rose-500/10 text-rose-100 font-bold text-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      )}

      {/* ZONE DE CONTENU */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header de bienvenue discret */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-8 justify-between">
            <h2 className="text-slate-400 font-semibold text-xs uppercase tracking-widest">
                Session Active : Dr. {auth.currentUser?.email?.split('@')[0]}
            </h2>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    MD
                </div>
            </div>
        </header>

        <div className="p-8">
          {mustChangePassword ? (
            <div className="max-w-md mx-auto mt-10 bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 text-center">
                <ShieldAlert size={56} className="text-amber-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-800 mb-2">Sécurité Requise</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Veuillez définir un nouveau mot de passe pour accéder aux dossiers.</p>
                <MedecinSettings />
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<MedecinDashboard />} />
              <Route path="/rendez-vous" element={<RendezVous />} />
              <Route path="/patients" element={<MesPatients />} />
              <Route path="/consultations" element={<ConsultationRoom />} />
              <Route path="/parametres" element={<MedecinSettings />} />
              <Route path="*" element={<Navigate to="/medecin" replace />} />
            </Routes>
          )}
        </div>
      </main>

      {/* MODAL DÉCONNEXION */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Quitter l'espace ?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                Assurez-vous d'avoir enregistré toutes vos consultations en cours avant de partir.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleLogout} 
                  className="w-full py-4 rounded-2xl bg-[#00469b] font-bold text-white text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
                >
                  Oui, me déconnecter
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className="w-full py-4 rounded-2xl bg-slate-100 font-bold text-slate-600 text-sm hover:bg-slate-200 transition-all"
                >
                  Rester connecté
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MedecinLayout;