import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Activity, AlertTriangle, 
  TrendingUp, Calendar, FileText, ShieldCheck,
  ArrowUpRight, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const AdminDashboard = () => {
  // États pour les compteurs réels
  const [counts, setCounts] = useState({
    medecins: 0,
    patients: 0,
    consultations: 0,
    alertes: 0
  });
  const [loading, setLoading] = useState(true);

  // 1. RÉCUPÉRATION DES DONNÉES RÉELLES
  useEffect(() => {
    // Écouteur pour les médecins (rôle "medicament" selon ta base)
    const qMed = query(collection(db, "utilisateurs"), where("rôle", "==", "medicament"));
    const unsubMed = onSnapshot(qMed, (snap) => {
      setCounts(prev => ({ ...prev, medecins: snap.size }));
    });

    // Écouteur pour les patients
    const qPat = query(collection(db, "utilisateurs"), where("rôle", "==", "patient"));
    const unsubPat = onSnapshot(qPat, (snap) => {
      setCounts(prev => ({ ...prev, patients: snap.size }));
    });

    // Écouteur pour les consultations
    const unsubCons = onSnapshot(collection(db, "consultations"), (snap) => {
      setCounts(prev => ({ ...prev, consultations: snap.size }));
    });

    setLoading(false);
    return () => { unsubMed(); unsubPat(); unsubCons(); };
  }, []);

  // Données dynamiques pour le graphique (basées sur les compteurs pour l'exemple)
  const chartData = [
    { name: 'Jan', patients: 10, consultations: 5 },
    { name: 'Fév', patients: counts.patients / 2, consultations: counts.consultations / 3 },
    { name: 'Mar', patients: counts.patients, consultations: counts.consultations },
  ];

  const stats = [
    { 
      title: "Médecins Actifs", 
      value: counts.medecins, 
      trend: "+2 ce mois",
      icon: Stethoscope, 
      color: "from-blue-600 to-blue-400", 
      shadow: "shadow-blue-100" 
    },
    { 
      title: "Patients Inscrits", 
      value: counts.patients, 
      trend: "Total base",
      icon: Users, 
      color: "from-emerald-600 to-teal-400", 
      shadow: "shadow-emerald-100" 
    },
    { 
      title: "Consultations", 
      value: counts.consultations, 
      trend: "Historique",
      icon: Activity, 
      color: "from-orange-500 to-amber-400", 
      shadow: "shadow-orange-100" 
    },
    { 
      title: "Alertes Critiques", 
      value: counts.alertes, 
      trend: "Urgent",
      icon: AlertTriangle, 
      color: "from-rose-600 to-red-400", 
      shadow: "shadow-rose-100" 
    },
  ];

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* HEADER AVEC DATE DYNAMIQUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-500 font-medium italic">Hôpital de District de Loum — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-black uppercase text-slate-500">Système Live</span>
          </div>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-1 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:scale-[1.02] transition-transform duration-300">
            <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                    <stat.icon size={28} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-500" /> {stat.trend}
                  </span>
               </div>
               <div>
                  <h3 className="text-4xl font-black text-slate-800 mb-1">{stat.value}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{stat.title}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPHIQUE ET ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECHARTS CONTAINER */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-white">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">Flux d'Activité</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inscriptions vs Consultations</p>
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
              <ArrowUpRight size={20} />
            </button>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPatients)" />
                <Area type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={4} fill="none" strokeDasharray="8 8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUICK ACTIONS SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-400/50 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <ShieldCheck className="text-emerald-400 mb-4" size={40} />
            <h3 className="text-2xl font-black mb-2 leading-tight">Sécurité &<br/>Audit</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Vérifiez les accès récents des médecins et les logs système.</p>
            <button className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/20">
              Lancer un rapport
            </button>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-white">
            <h4 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-[0.2em]">Outils de Gestion</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Plannings", icon: Calendar, bg: "bg-indigo-50", text: "text-indigo-600" },
                { label: "Dossiers", icon: FileText, bg: "bg-rose-50", text: "text-rose-600" },
              ].map((item, idx) => (
                <button key={idx} className={`p-6 rounded-[2rem] ${item.bg} flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform`}>
                  <item.icon className={item.text} size={24} />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;