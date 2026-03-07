import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Stethoscope, UserCog, LogOut, 
  Bell, FileText, ChevronRight, PlusCircle, X, Download
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
    // Simulation de génération de PDF/Texte
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
    { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/docteurs', icon: Stethoscope, label: 'Équipe Médicale' },
    { path: '/admin/profil', icon: UserCog, label: 'Paramètres Profil' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* --- SIDEBAR FLOTTANTE --- */}
      <aside className="w-72 bg-slate-900 m-4 rounded-[2.5rem] flex flex-col shadow-2xl shadow-slate-900/40 relative">
        {/* Glow Effect Background */}
        <div className="absolute top-20 -left-20 w-40 h-40 bg-blue-500/20 blur-[100px] rounded-full" />
        
        {/* Logo */}
        <div className="p-8 mb-6">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg tracking-tight leading-none">FirstAid</span>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">District Loum</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                  active 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className={`font-bold ${active ? 'text-white' : ''}`}>{item.label}</span>
                </div>
                {active && <ChevronRight size={18} className="animate-pulse" />}
              </Link>
            );
          })}

          <div className="pt-8 pb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-5 mb-4">Outils Rapides</p>
            <button 
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-all border border-dashed border-slate-700 hover:border-emerald-500/50"
            >
              <FileText size={22} />
              <span className="font-bold">Créer un Rapport</span>
              <PlusCircle size={16} className="ml-auto opacity-50" />
            </button>
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5"
          >
            <LogOut size={18} /> Quitter la Session
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Moderne */}
        <header className="h-24 flex justify-between items-center px-12">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Administration'}
            </h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Système Opérationnel</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-3 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100 hover:text-emerald-500 transition-all">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-8 border-l-2 border-slate-100">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 leading-none mb-1">Dr. Admin Loum</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Superviseur</p>
              </div>
              <div className="relative group cursor-pointer" onClick={() => navigate('/admin/profil')}>
                 <img 
                  src="https://ui-avatars.com/api/?name=Admin+Loum&background=10b981&color=fff&bold=true" 
                  alt="Avatar" 
                  className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-12 pb-8 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/docteurs" element={<DoctorManager />} />
            <Route path="/profil" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>

      {/* --- MODAL DE RÉDACTION DE RAPPORT --- */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-2xl"><FileText size={24}/></div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Générer un Rapport Administratif</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Compte-rendu d'activité hebdomadaire</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
            </div>
            <div className="p-8 space-y-6">
              <textarea 
                rows="8"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Décrivez les événements marquants, les statistiques ou les besoins matériels de l'hôpital..."
                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-700 placeholder:text-slate-300 resize-none transition-all"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-5 rounded-2xl bg-slate-100 font-black text-slate-500 uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Abandonner
                </button>
                <button 
                  onClick={generateReport}
                  disabled={!reportText}
                  className="flex-1 py-5 rounded-2xl bg-emerald-500 font-black text-white uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} /> Télécharger le Rapport (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DÉCONNEXION --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] animate-in fade-in">
           <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-white">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <LogOut size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Session Securisée</h3>
              <p className="text-slate-500 font-medium mt-2 mb-8">Voulez-vous vraiment fermer l'accès administratif ?</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-rose-500 font-black text-white uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">Confirmer la sortie</button>
                <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 rounded-2xl bg-slate-100 font-black text-slate-500 uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Rester connecté</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;