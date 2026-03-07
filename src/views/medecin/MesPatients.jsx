import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ExternalLink, Activity, 
  ShieldCheck, UserCircle, Info 
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const MesPatients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logique identique à ConsultationRoom : On prend TOUT sans filtre complexe
    const unsub = onSnapshot(collection(db, "utilisateurs"), (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.rôle === "patient" || u.role === "patient"); // On filtre juste pour avoir les patients

      console.log("Patients récupérés :", list.length);
      setPatients(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filtrage local pour la barre de recherche
  const filteredPatients = patients.filter(p => 
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Base Globale des Patients</h1>
          <p className="text-gray-500 font-medium text-sm italic">Affichage de tous les patients du service de neurologie</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un patient..." 
            className="pl-12 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm w-full md:w-80 focus:ring-2 focus:ring-blue-600 transition-all font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLEAU DES PATIENTS */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identité</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Âge / Sexe</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Médecin Assigné</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-blue-600 font-bold">Chargement...</td></tr>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-200">
                        {patient.nom ? patient.nom[0] : '?'}{patient.prenom ? patient.prenom[0] : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 uppercase leading-none mb-1">{patient.nom} {patient.prenom}</p>
                        <p className="font-mono text-[10px] text-gray-400">MAT: {patient.matrice || '---'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center text-sm text-gray-600 font-bold">
                    {patient.age || '--'} ans <span className="text-gray-300 mx-1">|</span> {patient.sexe || '--'}
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {patient.nomMedecin || "Non assigné"}
                    </p>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      patient.statut === 'En attente' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-green-100 text-green-600 border border-green-200'
                    }`}>
                      {patient.statut === 'En attente' ? <Activity size={12}/> : <ShieldCheck size={12}/>}
                      {patient.statut || "Nouveau"}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button className="p-3 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400 italic">Aucun patient trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER D'INFO */}
      <div className="bg-slate-800 p-6 rounded-[2rem] text-white flex items-center gap-4 shadow-xl">
        <div className="bg-blue-500/20 p-3 rounded-xl">
          <Info size={24} className="text-blue-400" />
        </div>
        <p className="text-sm font-medium opacity-90">
          Cette vue affiche l'ensemble des patients de la base de données. Vous pouvez voir le statut de chacun et le médecin qui lui a été attribué par la réception.
        </p>
      </div>
    </div>
  );
};

export default MesPatients;