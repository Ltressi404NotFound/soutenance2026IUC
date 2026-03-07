import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, Stethoscope, CheckCircle, 
  AlertCircle, UserCheck, Clock, ArrowRight, Users 
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

const PatientCheck = () => {
  const [search, setSearch] = useState("");
  const [allPatients, setAllPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "utilisateurs"), (snap) => {
      const usersData = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        nomComplet: `${d.data().prenom || ''} ${d.data().nom || ''}`.trim() || d.data().email || "Inconnu"
      }));

      // --- LOGIQUE DOCTEURS ---
      const docsList = usersData.filter(u => {
        // On récupère la valeur du rôle peu importe l'accent sur le nom du champ (rôle ou role)
        const roleValue = (u.rôle || u.role || "").toString().toLowerCase().trim();
        
        // On accepte toutes les variantes d'écriture de "médicament"
        return roleValue === "médicament" || 
               roleValue === "medicament" || 
               roleValue === "médicaments" ||
               roleValue === "medecin";
      });
      setDoctors(docsList);

      // --- LOGIQUE PATIENTS ---
      const patientsList = usersData.filter(u => {
        const roleValue = (u.rôle || u.role || "").toString().toLowerCase().trim();
        // Un patient est soit marqué "patient", soit n'a pas de rôle (ceux qui envoient des messages)
        return roleValue === "patient" || roleValue === "";
      });
      setAllPatients(patientsList);

    });

    return () => unsub();
  }, []);

  // Recherche sur Nom, Matrice (ton champ Firebase) ou Email
  const filteredPatients = allPatients.filter(p => 
    p.nomComplet?.toLowerCase().includes(search.toLowerCase()) || 
    p.matrice?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignation = async () => {
    if (!selectedPatient || !selectedDoctor) return;
    setLoading(true);
    try {
      const userRef = doc(db, "utilisateurs", selectedPatient.id);
      await updateDoc(userRef, {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.nomComplet, // Utilise le nom normalisé
        patientId: selectedPatient.id, // Correction pour ton app Flutter
        statut: "En attente",
        dateAssignation: new Date().toISOString()
      });
      
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setSearch("");
      alert("Patient orienté avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de mise à jour. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4">
      
      {/* STATS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-800">Admission & Orientation</h2>
          <p className="text-gray-500 font-medium">Gestion des flux : Patients enregistrés et Messagerie.</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2">
                <Users size={18}/> {allPatients.length} Patients
            </div>
            <div className="bg-green-50 text-green-700 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2">
                <Stethoscope size={18}/> {doctors.length} Médecins
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* RECHERCHE PATIENT */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-[550px]">
          <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-4">Étape 1 : Sélectionner le Patient</h3>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-4 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Nom, matricule ou email..." 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    selectedPatient?.id === p.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${selectedPatient?.id === p.id ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow-sm'}`}>
                      {p.nomComplet.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{p.nomComplet}</p>
                      <p className="text-[10px] text-gray-400 font-black">MATRICE: {p.matrice || 'NOUVEAU MESSAGE'}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className={selectedPatient?.id === p.id ? 'text-blue-600' : 'opacity-0'} />
                </button>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic">Aucun patient disponible</div>
            )}
          </div>
        </div>

        {/* LISTE MÉDECINS */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-[550px]">
          <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-4">Étape 2 : Choisir le Médecin</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-6">
            {doctors.map(doc => (
              <button 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  selectedDoctor?.id === doc.id ? 'border-green-600 bg-green-50 shadow-md' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${selectedDoctor?.id === doc.id ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'}`}>
                    <Stethoscope size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800">Dr. {doc.nomComplet}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{doc.specialite || 'Généraliste'}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-4 ${selectedDoctor?.id === doc.id ? 'border-green-600 bg-white' : 'border-gray-200'}`} />
              </button>
            ))}
          </div>
          <button 
            onClick={handleAssignation}
            disabled={!selectedDoctor || !selectedPatient || loading}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl shadow-gray-200"
          >
            {loading ? "Traitement..." : "Finaliser l'Orientation"}
          </button>
        </div>
      </div>

      {/* TABLEAU DE SUIVI (FILE D'ATTENTE) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-gray-800 text-xl flex items-center gap-3"><Clock className="text-blue-600" /> File d'attente active</h3>
            <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase">Mise à jour automatique</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Médecin</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigné le</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allPatients.filter(p => p.doctorId).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-gray-800">{p.nomComplet}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{p.email}</p>
                  </td>
                  <td className="p-6 text-sm font-bold text-gray-700">Dr. {p.doctorName}</td>
                  <td className="p-6 text-xs text-gray-500 font-medium">
                    {p.dateAssignation ? new Date(p.dateAssignation).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center w-fit gap-2 ${
                      p.statut === "Reçu" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700 animate-pulse"
                    }`}>
                      {p.statut === "Reçu" ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                      {p.statut || "En attente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientCheck;