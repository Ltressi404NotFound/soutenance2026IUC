import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Clock, TrendingUp, Calendar, UserPlus, ClipboardList, ChevronRight } from 'lucide-react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom'; // Pour les raccourcis

const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, messages: 0, unread: 0 });
  
  // Simulation de données pour le graphique (A remplacer par tes logs Firebase si besoin)
  const chartData = [
    { name: 'Lun', flux: 12 }, { name: 'Mar', flux: 19 },
    { name: 'Mer', flux: 15 }, { name: 'Jeu', flux: 22 },
    { name: 'Ven', flux: 30 }, { name: 'Sam', flux: 10 },
    { name: 'Dim', flux: 5 },
  ];

  useEffect(() => {
    const q = query(collection(db, "chats"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => doc.data());
      setStats({
        patients: new Set(allMsgs.map(m => m.patientId)).size,
        messages: allMsgs.length,
        unread: allMsgs.filter(m => !m.isFromAdmin).length
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Vue d'ensemble</h1>
          <p className="text-gray-500 font-medium">Statistiques et accès rapides aux services.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-blue-600">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="text-xs text-gray-400">Système opérationnel</p>
        </div>
      </div>

      {/* STATS RÉELLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Patients Total" value={stats.patients} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Nouv. Messages" value={stats.unread} icon={MessageCircle} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Temps de réponse" value="14 min" icon={Clock} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Flux Hebdo" value="+12%" icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* GRAPHIQUE DE FLUX */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800">Fréquentation Patients</h3>
            <select className="text-xs font-bold border-none bg-gray-50 rounded-lg p-2 outline-none">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFlux" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="flux" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorFlux)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RACCOURCIS VERS PAGES */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-800 ml-2">Actions Rapides</h3>
          <ShortcutCard 
            title="Admission Patient" 
            desc="Enregistrer un nouveau venu" 
            icon={UserPlus} 
            color="bg-blue-600" 
            onClick={() => navigate('/admission')} 
          />
          
          <ShortcutCard 
            title="Messagerie" 
            desc="Répondre aux familles" 
            icon={MessageCircle} 
            color="bg-green-500" 
            onClick={() => navigate('/chat')} 
          />

          <ShortcutCard 
            title="Planning Garde" 
            desc="Voir les médecins dispos" 
            icon={Calendar} 
            color="bg-purple-500" 
            onClick={() => navigate('/planning')} 
          />

          <div className="bg-gray-900 p-6 rounded-[2rem] text-white overflow-hidden relative group cursor-pointer">
            <div className="relative z-10">
              <p className="text-xs opacity-60 font-bold uppercase tracking-widest mb-1">Rapport de crise</p>
              <p className="text-lg font-bold">Générer le bilan mensuel</p>
            </div>
            <ClipboardList className="absolute -right-4 -bottom-4 size-24 opacity-10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les cartes de stats
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-xl transition-all group">
    <div className={`${bg} ${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-gray-800">{value}</p>
  </div>
);

// Composant pour les boutons raccourcis
const ShortcutCard = ({ title, desc, icon: Icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-gray-50 hover:border-blue-200 hover:shadow-md transition-all text-left group"
  >
    <div className={`${color} p-3 rounded-2xl text-white shadow-lg shadow-blue-100`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-black text-gray-800">{title}</p>
      <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
    </div>
    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
  </button>
);

export default ReceptionDashboard;