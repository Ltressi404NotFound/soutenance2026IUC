import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Clock, AlertTriangle, 
  MessageSquare, UserCheck, Calendar, ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const MedecinDashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);

  // Données du graphique (peuvent aussi être rendues dynamiques plus tard)
  const data = [
    { name: 'Lun', crises: 4 }, { name: 'Mar', crises: 3 },
    { name: 'Mer', crises: 2 }, { name: 'Jeu', crises: 6 },
    { name: 'Ven', crises: 8 }, { name: 'Sam', crises: 1 }, { name: 'Dim', crises: 0 },
  ];

  useEffect(() => {
    // Récupérer le nombre de patients assignés à ce médecin (Exemple statique ou filtré par ID)
    const unsub = onSnapshot(collection(db, "utilisateurs"), (snap) => {
      const allUsers = snap.docs.map(d => d.data());
      setPatientCount(allUsers.filter(u => u.rôle === "patient" || u.role === "patient").length);
      setWaitingCount(allUsers.filter(u => u.statut === "En attente").length);
    });
    return () => unsub();
  }, []);

  const shortcuts = [
    { label: "Ma File d'Attente", path: "/medecin/patients", icon: Clock, color: "bg-blue-600" },
    { label: "Messagerie", path: "/medecin/messages", icon: MessageSquare, color: "bg-indigo-600" },
    { label: "Planning", path: "/medecin/parametres", icon: Calendar, color: "bg-slate-800" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER AVEC SALUTATIONS DYNAMIQUES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Tableau de Bord Médical</h1>
          <p className="text-gray-500 font-medium">Gestion de vos consultations et suivi neurologique.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Dr. Loum</p>
          <p className="text-xs text-gray-400">Neurologue Principal</p>
        </div>
      </div>

      {/* RACCOURCIS RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shortcuts.map((s, i) => (
          <Link key={i} to={s.path} className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`${s.color} p-3 rounded-2xl text-white shadow-lg`}>
                <s.icon size={20} />
              </div>
              <span className="font-bold text-gray-700">{s.label}</span>
            </div>
            <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
          </Link>
        ))}
      </div>

      {/* CARTES STATS DYNAMIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Patients", value: patientCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "En attente", value: waitingCount, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Crises /7j", value: "12", icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Urgences", value: "02", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-5 relative overflow-hidden group">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
              <stat.icon size={24} />
            </div>
            <div className="z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${stat.color} group-hover:opacity-[0.08] transition-opacity`}>
               <stat.icon size={100} />
            </div>
          </div>
        ))}
      </div>

      {/* GRAPHIQUE AMÉLIORÉ (BLEU MÉDICAL) */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Activity className="text-blue-500" /> Analyse des Crises
          </h3>
          <select className="bg-gray-50 border-none rounded-xl text-xs font-bold p-2 outline-none">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="crises" 
                stroke="#2563eb" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorBlue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MedecinDashboard;