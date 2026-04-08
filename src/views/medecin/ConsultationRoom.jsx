import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, User, BookOpen, Printer, 
  X, Info, CheckCircle2, FlaskConical, LoaderCircle 
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import { 
  collection, onSnapshot, doc, updateDoc, 
  addDoc, serverTimestamp, query, where 
} from 'firebase/firestore';

const ConsultationRoom = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true); // Ajout d'un état de chargement
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [prescription, setPrescription] = useState('');
  const [labResults, setLabResults] = useState('');

  // 1. RÉCUPÉRATION FILTRÉE
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "utilisateurs"), 
      where("statut", "==", "En attente")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPatients(list);
      setLoading(false);
    }, (error) => {
      console.error("Erreur Snapshot:", error);
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const openCarnet = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // 2. FINALISATION
  const handleFinalize = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      // Étape A : Sauvegarde
      await addDoc(collection(db, "consultations"), {
        patientId: selectedPatient.id,
        patientNom: `${selectedPatient.prenom} ${selectedPatient.nom}`,
        resultatsLabo: labResults,
        prescription: prescription,
        date: serverTimestamp(),
      });

      // Étape B : Mise à jour du statut
      const patientRef = doc(db, "utilisateurs", selectedPatient.id);
      await updateDoc(patientRef, {
        statut: "Consulté",
        derniereConsultation: serverTimestamp()
      });

      // Étape C : Fermeture et Nettoyage AVANT l'impression pour éviter les erreurs de DOM
      setShowModal(false);
      setPrescription('');
      setLabResults('');
      
      // Petit délai pour laisser le DOM se mettre à jour sans la modale avant d'imprimer
      setTimeout(() => {
        window.print();
        setSelectedPatient(null);
      }, 300);

    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
      alert("Erreur de mise à jour.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
          <ClipboardCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-800">Salle de Consultation</h1>
          <p className="text-gray-500 font-medium">
            {loading ? "Chargement..." : `Fichiers en attente : ${patients.length}`}
          </p>
        </div>
      </div>

      {/* LISTE DES PATIENTS AVEC PROTECTION CONTRE LES CRASHES */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <LoaderCircle className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-xs font-black uppercase text-gray-400">Patient</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400">Matricule</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400">Statut</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? patients.map((p) => (
                <tr key={`patient-${p.id}`} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={18} />
                    </div>
                    <span className="font-bold text-gray-700">{p.prenom} {p.nom}</span>
                  </td>
                  <td className="p-6 font-mono text-sm text-gray-500">{p.matrice || 'LOUM-00'}</td>
                  <td className="p-6">
                    <span className="px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase">
                      {p.statut}
                    </span>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => openCarnet(p)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                    >
                      <BookOpen size={18} /> Ouvrir Carnet
                    </button>
                  </td>
                </tr>
              )) : (
                <tr key="empty-row">
                  <td colSpan="4" className="p-10 text-center text-gray-400 font-medium italic">
                    Aucun patient en attente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CONSULTATION */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
               <h2 className="text-2xl font-black italic">Consultation : {selectedPatient.prenom}</h2>
               <button 
                 type="button"
                 onClick={() => setShowModal(false)}
                 className="p-2 hover:bg-white/20 rounded-full transition"
               >
                 <X size={24} />
               </button>
            </div>
            
            <form onSubmit={handleFinalize} className="p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                    <FlaskConical size={14} /> Résultats Labo
                  </label>
                  <textarea 
                    value={labResults}
                    onChange={(e) => setLabResults(e.target.value)}
                    placeholder="Résultats d'analyses..."
                    className="w-full p-5 bg-gray-50 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 border-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                    <CheckCircle2 size={14} /> Prescription
                  </label>
                  <textarea 
                    required
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Traitement recommandé..."
                    className="w-full p-5 bg-gray-50 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 border-none"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Printer size={20} /> Valider & Imprimer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom;