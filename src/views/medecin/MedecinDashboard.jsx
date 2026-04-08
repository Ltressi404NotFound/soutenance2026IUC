import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Activity, Clock, AlertTriangle, 
  Calendar, Bell, ChevronRight, CheckCircle2, 
  ArrowUpRight, FileText, DollarSign, ClipboardCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { db, auth } from '../../firebaseConfig';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

const MedecinDashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [todayApps, setTodayApps] = useState(0);
  const [loading, setLoading] = useState(true);

  // Données factices pour le graphique en barres (style image)
  const barData = [
    { name: 'Jan', val: 65, color: '#3b82f6' },
    { name: 'Feb', val: 75, color: '#10b981' },
    { name: 'Mar', val: 62, color: '#f43f5e' },
    { name: 'Apr', val: 85, color: '#eab308' },
    { name: 'May', val: 70, color: '#3b82f6' },
    { name: 'Jun', val: 78, color: '#10b981' },
  ];

  useEffect(() => {
    // 1. Compte total des patients
    const unsubUsers = onSnapshot(collection(db, "utilisateurs"), (snap) => {
      const docs = snap.docs.map(d => d.data());
      setPatientCount(docs.filter(u => u.role === "patient" || u.rôle === "patient").length);
    });

    // 2. RÉCUPÉRATION DES RENDEZ-VOUS (Créés par la réception)
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const qApps = query(
      collection(db, "rendezvous"),
      where("date", "==", today),
      orderBy("heure", "asc")
    );

    const unsubApps = onSnapshot(qApps, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(list);
      setTodayApps(list.length);
      setLoading(false);
    });

    return () => { unsubUsers(); unsubApps(); };
  }, []);

  // Composant pour les petites cartes du haut (Style Image)
  const StatCard = ({ title, count, icon: Icon, colorClass }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{count}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Chargement du Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 lg:p-8">
      
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* 4 CARRES DE STATISTIQUES (Inspiré de l'image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Patients" count={patientCount} icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Rdv Aujourd'hui" count={todayApps} icon={Calendar} colorClass="bg-green-500" />
        <StatCard title="Prescriptions" count="12" icon={ClipboardCheck} colorClass="bg-emerald-500" />
        <StatCard title="Consultations" count="08" icon={Activity} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* GRAPHIQUE EN BARRES (Style Image) */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6 text-center">Statistiques Mensuelles Patients</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '10px', border: 'none', shadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="val" radius={[5, 5, 0, 0]} barSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LISTE DES RENDEZ-VOUS DU JOUR (Récupérés de la réception) */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Agenda du Jour</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-black uppercase">Live</span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {appointments.length > 0 ? appointments.map((app) => (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Clock size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{app.heure} - {app.motif || 'Checkup'}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            )) : (
              <div className="text-center py-10">
                <Calendar size={40} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400 font-medium italic">Aucun patient programmé par la réception aujourd'hui.</p>
              </div>
            )}
          </div>

          <button className="w-full mt-6 py-3 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all uppercase tracking-widest">
            Voir tout l'agenda
          </button>
        </div>

      </div>
    </div>
  );
};

export default MedecinDashboard;