import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { 
  collection, getDocs, addDoc, query, where, 
  serverTimestamp, onSnapshot, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { 
  LoaderCircle, CheckCircle, Trash2, Edit, Loader2, 
  Calendar, Clock, User, AlignLeft, Search, AlertCircle
} from 'lucide-react';

const AjoutRendezVous = () => {
  const [patients, setPatients] = useState([]);
  const [rendezVous, setRendezVous] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0], 
    heure: '',
    motif: 'Consultation Routine'
  });
  const [loading, setLoading] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);
  const [success, setSuccess] = useState(false);

  const FIRESTORE_COLLECTION = "rendez-vous"; 

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, "utilisateurs"), where("role", "in", ["patient", "Patient"]));
        const snap = await getDocs(q);
        setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Erreur patients:", e); }
    };
    fetchPatients();

    const qRdv = collection(db, FIRESTORE_COLLECTION);
    const unsubscribe = onSnapshot(qRdv, (snapshot) => {
      setRendezVous(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setInitialFetch(false);
    }, (error) => {
      setInitialFetch(false);
    });

    return () => unsubscribe();
  }, []);

  const formatToInputDate = (dateStr) => {
    if (!dateStr || !dateStr.includes('/')) return dateStr;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        "Nom du patient": formData.patientName, 
        "motif": formData.motif,
        "date": formData.date,
        "heure": formData.heure,
        "patientId": formData.patientId,
        "statut": "En attente"
      };

      if (editingId) {
        await updateDoc(doc(db, FIRESTORE_COLLECTION, editingId), { ...payload, updatedAt: serverTimestamp() });
        setEditingId(null);
      } else {
        await addDoc(collection(db, FIRESTORE_COLLECTION), { ...payload, createdAt: serverTimestamp() });
      }
      setSuccess(true);
      setFormData({ ...formData, heure: '', patientId: '', patientName: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
    setLoading(false);
  };

  const handleEdit = (rdv) => {
    setEditingId(rdv.id);
    setFormData({
      patientId: rdv.patientId || '',
      patientName: rdv["Nom du patient"] || '',
      date: formatToInputDate(rdv.date), 
      heure: rdv.heure || '',
      motif: rdv.motif || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initialFetch) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <LoaderCircle className="animate-spin text-blue-600" size={50} />
        <p className="text-slate-500 font-medium animate-pulse">Initialisation du système...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 bg-[#FBFDFF] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Visites</h1>
          <p className="text-slate-500 text-sm">Hôpital de Loum • Système de synchronisation Cloud</p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          Base de données à jour
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULAIRE (40%) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden sticky top-6">
            <div className={`p-8 text-white transition-all duration-500 ${editingId ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                {editingId ? <Edit size={24} /> : <Calendar size={24} />}
              </div>
              <h2 className="text-2xl font-bold italic">
                {editingId ? "Mode Edition" : "Planifier un RDV"}
              </h2>
              <p className="text-white/70 text-xs mt-1 italic">Remplissez les informations du patient</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 animate-bounce">
                  <CheckCircle size={20} />
                  <span className="text-sm font-bold font-mono text-[10px]">TRANSMISSION RÉUSSIE !</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sélection Patient</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.25rem] text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      value={formData.patientId}
                      onChange={(e) => {
                        const p = patients.find(p => p.id === e.target.value);
                        setFormData({...formData, patientId: e.target.value, patientName: p ? (p.nom || p.name) : ''});
                      }}
                    >
                      <option value="">Choisir...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.nom || p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date</label>
                    <input 
                      type="date" required 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Heure</label>
                    <input 
                      type="time" required 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.heure} 
                      onChange={(e) => setFormData({...formData, heure: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Motif Médical</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Ex: Analyse de sang, Consultation..."
                      value={formData.motif}
                      onChange={(e) => setFormData({...formData, motif: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-4 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-3 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                {editingId ? "METTRE À JOUR" : "VALIDER LE RENDEZ-VOUS"}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="w-full py-3 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
                >
                  Annuler la modification
                </button>
              )}
            </form>
          </div>
        </div>

        {/* LISTE (60%) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 italic">File d'attente</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Données synchronisées en temps réel</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                <Search size={20} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                    <th className="px-8 py-5">Patient</th>
                    <th className="px-8 py-5">Planning</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rendezVous.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                          <AlertCircle size={48} className="mb-2" />
                          <p className="font-bold">Aucun rendez-vous aujourd'hui</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rendezVous.map((rdv) => (
                      <tr key={rdv.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xs">
                              {rdv["Nom du patient"]?.substring(0,2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{rdv["Nom du patient"]}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-blue-600">{rdv.date}</span>
                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase">
                              <Clock size={10} /> {rdv.heure}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(rdv)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all">
                              <Edit size={16}/>
                            </button>
                            <button onClick={() => deleteDoc(doc(db, FIRESTORE_COLLECTION, rdv.id))} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjoutRendezVous;