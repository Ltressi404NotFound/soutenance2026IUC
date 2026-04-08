import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Activity, Zap, LoaderCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ medecins: 0, patients: 0, consultations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lecture des données en temps réel
    const unsub = onSnapshot(collection(db, "rendez-vous"), (snap) => {
      setCounts(prev => ({ ...prev, consultations: snap.size }));
      setLoading(false); // On arrête le chargement une fois les données reçues
    });

    return () => unsub();
  }, []);

  const chartData = [
    { name: 'Jan', val: 40 }, { name: 'Fév', val: 55 }, { name: 'Mar', val: 45 },
    { name: 'Avr', val: 80 }, { name: 'Mai', val: 65 }, { name: 'Juin', val: 75 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      {/* CORRECTION 1: On ne "return" pas tôt avec le loader. 
         On garde la structure parente identique pour éviter le crash "insertBefore".
      */}
      {loading ? (
        <div className="h-[80vh] flex flex-col items-center justify-center">
           <LoaderCircle className="animate-spin text-blue-600" size={48} />
           <p className="mt-4 text-slate-500 font-medium">Chargement des statistiques...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header>
            <h2 className="text-2xl font-black text-slate-800 italic">Tableau de Bord</h2>
            <p className="text-slate-400 text-sm">Gestion globale de l'Hôpital de Loum</p>
          </header>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Patients" value={counts.patients} icon={Users} color="bg-emerald-500" />
            <StatCard label="Rendez-vous" value={counts.consultations} icon={Activity} color="bg-blue-600" />
            <StatCard label="Urgences" value="3" icon={Zap} color="bg-rose-500" />
          </div>

          {/* GRAPHIQUE */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Fréquentation Mensuelle</h3>
            {/* CORRECTION 2: On fixe une hauteur au container parent 
               et on ajoute minWidth pour Recharts.
            */}
            <div style={{ width: '100%', height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="val" radius={[10, 10, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00469b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Petit composant interne pour les cartes
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white`}>
      <Icon size={24} />
    </div>
  </div>
);

export default AdminDashboard;