import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, FileText, Edit3, 
  Search, Filter, ChevronRight, Save, X, CheckCircle 
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, doc, updateDoc, orderBy } from 'firebase/firestore';

const RendezVous = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newObservations, setNewObservations] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Récupération des rendez-vous
  useEffect(() => {
    // Note: Assurez-vous que le nom de la collection est correct ("rendezvous" ou "rendez-vous")
    const q = query(collection(db, "rendezvous"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Mise à jour du carnet et retrait de la liste
  const handleUpdateCarnet = async () => {
    if (!selectedPatient || !newObservations.trim()) return;
    
    try {
      // Étape A : Mettre à jour les observations chez l'utilisateur
      const patientRef = doc(db, "utilisateurs", selectedPatient.patientId);
      await updateDoc(patientRef, { 
        carnetObservations: newObservations,
        statut: "Consulté" // Pour la cohérence avec ton app Flutter
      });

      // Étape B : Marquer le rendez-vous comme traité pour qu'il disparaisse du filtre
      const appointmentRef = doc(db, "rendezvous", selectedPatient.id);
      await updateDoc(appointmentRef, { 
        carnetObservations: newObservations, // On l'ajoute ici aussi pour le filtre immédiat
        statut: "terminé" 
      });

      setSelectedPatient(null);
      setNewObservations("");
      alert("Carnet enregistré. Le patient a été retiré des rendez-vous à venir.");
    } catch (error) {
      console.error("Erreur mise à jour carnet:", error);
    }
  };

  // 3. FILTRAGE : On retire ceux qui ont déjà des observations (carnet édité)
  const filteredApps = appointments.filter(app => {
    const matchesSearch = app.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    // On ne garde que ceux qui n'ont PAS encore d'observations
    const isNotEdited = !app.carnetObservations; 
    return matchesSearch && isNotEdited;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans">
      
      {/* HEADER DE PAGE */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Agenda des Consultations</h1>
          <p className="text-sm text-slate-500 font-medium italic">Seuls les patients en attente d'édition de carnet sont affichés.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <div className="p-3 text-slate-400"><Search size={18} /></div>
          <input 
            type="text" 
            placeholder="Rechercher un patient..." 
            className="p-2 outline-none text-sm w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLEAU DES RENDEZ-VOUS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date & Heure</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type / Motif</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApps.length > 0 ? filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{app.date}</p>
                      <p className="text-[11px] text-slate-400 font-bold">{app.heure || "08:30"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white shadow-sm">
                      {app.patientName?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{app.patientName}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 uppercase">
                    {app.motif || "Général"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                    <span className="text-[10px] font-black text-orange-600 uppercase">En attente</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => {
                      setSelectedPatient(app);
                      setNewObservations("");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                  >
                    <Edit3 size={14} /> Éditer
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={40} />
                    <p className="text-slate-400 font-medium italic">Tous les carnets du jour ont été traités.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL D'ÉDITION */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-white animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">Mise à jour du Carnet</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Patient: {selectedPatient.patientName}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <FileText size={14} className="text-blue-500" /> Observations Médicales
              </label>
              <textarea 
                className="w-full h-48 p-5 border-none rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all text-sm leading-relaxed text-slate-700 shadow-inner"
                placeholder="Décrivez les résultats de la consultation..."
                value={newObservations}
                onChange={(e) => setNewObservations(e.target.value)}
              />
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleUpdateCarnet}
                  className="flex-[2] py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <Save size={18} /> Enregistrer & Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RendezVous;