import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Stethoscope, UserCog, LogOut, 
  Bell, FileText, PlusCircle, X, Download
} from 'lucide-react';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

// Pages
import AdminDashboard from './AdminDashboard';
import DoctorManager from './DoctorManager';
import AdminProfile from './AdminProfile';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");

  const handleLogout = () => signOut(auth).then(() => navigate('/login'));

  const generateReport = () => {
    const blob = new Blob([`RAPPORT ADMINISTRATIF - FIRSTAID LOUM\nDate: ${new Date().toLocaleDateString()}\n\nContenu:\n${reportText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Admin_${Date.now()}.txt`;
    link.click();
    setShowReportModal(false);
    setReportText("");
    alert("Rapport généré avec succès !");
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/admin/docteurs', icon: Stethoscope, label: 'Équipe Médicale' },
    { path: '/admin/profil', icon: UserCog, label: 'Mon compte' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR - Style Bleu Foncé Identique à l'image Réception */}
      <aside className="w-72 bg-[#00469b] flex flex-col h-full shadow-xl z-20">
        
        {/* HEADER SECTION (Style de l'image) */}
        <div className="p-8 mb-6">
          <h1 className="text-white text-2xl font-black tracking-tighter leading-tight italic">
            PREMIERS <br /> SECOURS
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[#34d399] font-bold text-lg italic">Hôpital</span>
            <span className="h-[2px] w-8 bg-[#34d399]/30"></span>
          </div>
          <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-4">
            Espace Administrateur
          </p>
        </div>

        {/* Navigation */}
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

          <div className="pt-6">
            <p className="text-blue-200/30 text-[10px] font-black uppercase tracking-[0.3em] px-6 mb-4">Rapports</p>
            <button 
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all border border-dashed border-white/20"
            >
              <FileText size={20} />
              <span className="font-bold text-sm text-left">Nouveau Rapport</span>
              <PlusCircle size={14} className="ml-auto opacity-50" />
            </button>
          </div>
        </nav>

        {/* LOGOUT BUTTON (Encadré en rouge comme sur l'image) */}
        <div className="p-6">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-rose-500/30 bg-rose-500/10 text-rose-100 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all duration-300"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ZONE DE CONTENU */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-8 justify-between">
            <h2 className="text-slate-400 font-semibold text-xs uppercase tracking-widest">
                Contrôle Administratif : {auth.currentUser?.email}
            </h2>
            <button className="relative p-2 text-slate-400 hover:text-[#00469b] transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
        </header>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/docteurs" element={<DoctorManager />} />
            <Route path="/profil" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>

      {/* MODAL RAPPORT (Modernisé) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95">
            <div className="bg-[#00469b] p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <FileText size={24}/>
                <h3 className="text-xl font-bold italic tracking-tight">Rapport d'Activité</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
            </div>
            <div className="p-8">
              <textarea 
                rows="6"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Détails du rapport administratif..."
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-[#00469b] outline-none transition-all"
              />
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={generateReport}
                  className="flex-1 py-4 rounded-2xl bg-[#00469b] font-bold text-white hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Download size={18} /> Télécharger (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉCONNEXION */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Fermer la session ?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                Vous allez quitter l'interface d'administration sécurisée de l'Hôpital de Loum.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-[#00469b] font-bold text-white hover:bg-blue-800 transition-all shadow-lg">Confirmer</button>
                <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 rounded-2xl bg-slate-100 font-bold text-slate-600">Annuler</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;