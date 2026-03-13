import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardList, Settings, 
  LogOut, ShieldAlert, HeartPulse, X, Bell 
} from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Importation propre de signOut

// Importations des sous-vues
import MedecinDashboard from "./MedecinDashboard";
import MedecinSettings from "./MedecinSettings";
import ConsultationRoom from "./ConsultationRoom";
import MesPatients from "./MesPatients";

const MedecinLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // NOUVEAU : État pour afficher/masquer la modale de déconnexion
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

  // LOGIQUE DE DÉCONNEXION (Identique à ton code Admin)
  const handleLogout = () => signOut(auth).then(() => {
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true });
  });

  const menuItems = [
    { path: '/medecin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/medecin/consultations', icon: ClipboardList, label: 'Consultations' },
    { path: '/medecin/patients', icon: Users, label: 'Mes Patients' },
    { path: '/medecin/parametres', icon: Settings, label: 'Paramètres' },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#28a745] border-r-transparent"></div>
        <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Chargement sécurisé...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans antialiased text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      {!mustChangePassword && (
        <aside className="w-80 bg-white m-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col border border-white overflow-hidden animate-in slide-in-from-left duration-500">
          
          <div className="p-8 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#28a745] to-[#208a38] p-3 rounded-2xl shadow-lg shadow-green-200 ring-4 ring-green-50">
                <HeartPulse color="white" size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 leading-none">FirstAid</span>
                <span className="text-xs font-bold text-[#28a745] uppercase tracking-[0.2em]">Medical Center</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-3">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4 mb-4">Menu Principal</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] font-bold transition-all duration-300 group ${
                    isActive 
                    ? 'bg-gradient-to-r from-green-50 to-white text-[#28a745] shadow-sm ring-1 ring-green-100' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <item.icon size={22} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#28a745] animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* SECTION DÉCONNEXION */}
          <div className="p-6 mt-auto">
            <div className="bg-slate-50 p-4 rounded-3xl mb-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Session</p>
                <p className="text-sm font-bold text-slate-700 truncate">{auth.currentUser?.email}</p>
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(true)} // Déclenche la modale
              className="w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] bg-rose-50 text-rose-600 font-black uppercase text-xs tracking-widest hover:bg-rose-100 transition-all active:scale-95"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </aside>
      )}

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-10 max-w-7xl mx-auto">
          {mustChangePassword ? (
            <div className="max-w-xl mx-auto mt-20 animate-in zoom-in duration-500">
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-orange-200/40 border border-orange-50 text-center space-y-8">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-orange-50">
                      <ShieldAlert size={48} />
                    </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Sécurité Requise</h2>
                  <p className="text-slate-500 font-medium px-4">Changez votre mot de passe pour continuer.</p>
                </div>
                <MedecinSettings />
                <button onClick={() => setShowLogoutConfirm(true)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
                  Quitter la session
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Routes>
                <Route path="/" element={<MedecinDashboard />} />
                <Route path="/consultations" element={<ConsultationRoom />} />
                <Route path="/patients" element={<MesPatients />} />
                <Route path="/parametres" element={<MedecinSettings />} />
                <Route path="*" element={<Navigate to="/medecin" replace />} />
              </Routes>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CONFIRMATION (Inspiré de ton code Admin) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] animate-in fade-in duration-300">
           <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-white animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Fin de session ?</h3>
              <p className="text-slate-500 font-medium mt-2 mb-8">Voulez-vous fermer l'accès au dossier médical ?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleLogout} 
                  className="w-full py-4 rounded-2xl bg-rose-500 font-black text-white uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Confirmer la déconnexion
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className="w-full py-4 rounded-2xl bg-slate-100 font-black text-slate-500 uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MedecinLayout;