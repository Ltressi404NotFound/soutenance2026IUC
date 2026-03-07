import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, User, BookOpen, Printer, 
  X, Send, Info, CheckCircle2, FlaskConical 
} from 'lucide-react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const ConsultationRoom = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [prescription, setPrescription] = useState('');
  const [labResults, setLabResults] = useState('');

  // 1. Récupérer les patients assignés (statut "En attente")
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "utilisateurs"), (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.statut === "En attente"); // On ne montre que ceux qui attendent le doc
      setPatients(list);
    });
    return () => unsub();
  }, []);

  // 2. Ouvrir le carnet et pré-remplir
  const openCarnet = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // 3. Sauvegarder et Imprimer
  const handleFinalize = async (e) => {
    e.preventDefault();
    try {
      // Sauvegarder la consultation dans une nouvelle collection
      await addDoc(collection(db, "consultations"), {
        patientId: selectedPatient.id,
        patientNom: `${selectedPatient.prenom} ${selectedPatient.nom}`,
        resultatsLabo: labResults,
        prescription: prescription,
        date: serverTimestamp(),
      });

      // Mettre à jour le statut du patient
      await updateDoc(doc(db, "utilisateurs", selectedPatient.id), {
        statut: "Consulté"
      });

      window.print(); // Lancer l'impression
      setShowModal(false);
      setPrescription('');
      setLabResults('');
    } catch (error) {
      console.error("Erreur:", error);
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
          <p className="text-gray-500 font-medium">Gérez vos patients en attente et vos prescriptions.</p>
        </div>
      </div>

      {/* TABLEAU DES PATIENTS ASSIGNÉS */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
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
              <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                <td className="p-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={18} />
                  </div>
                  <span className="font-bold text-gray-700">{p.prenom} {p.nom}</span>
                </td>
                <td className="p-6 font-mono text-sm text-gray-500">{p.matrice || '---'}</td>
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
                    <BookOpen size={18} /> Carnet
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400 font-medium">
                  Aucun patient dans votre file d'attente pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CADRE D'EXPLICATION */}
      <div className="bg-slate-800 p-6 rounded-[2rem] text-white flex items-start gap-4 shadow-xl">
        <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
          <Info size={24} />
        </div>
        <div>
          <h4 className="font-bold text-lg">Comment fonctionne cette page ?</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Cliquez sur <strong>"Carnet"</strong> pour ouvrir le dossier d'un patient. 
            Une fois la prescription validée, le patient passe en statut <strong>"Consulté"</strong> 
            et disparaît de cette liste. Un document PDF sera généré automatiquement pour l'impression.
          </p>
        </div>
      </div>

      {/* MODAL DE CONSULTATION (FLOU) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic">Examen : {selectedPatient?.prenom} {selectedPatient?.nom}</h2>
                  <p className="text-blue-100 text-sm">Matricule: {selectedPatient?.matrice}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            {/* Formulaire Modal */}
            <form onSubmit={handleFinalize} className="p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-6 text-print">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                    <FlaskConical size={14} className="text-blue-500" /> Résultats Laboratoire
                  </label>
                  <textarea 
                    value={labResults}
                    onChange={(e) => setLabResults(e.target.value)}
                    placeholder="Saisissez les résultats d'analyses ici..."
                    className="w-full p-5 bg-gray-50 border-none rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" /> Prescription & Messages
                  </label>
                  <textarea 
                    required
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Détails du traitement et recommandations..."
                    className="w-full p-5 bg-gray-50 border-none rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 shadow-lg transition"
                >
                  <Printer size={20} /> Valider & Imprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLE POUR L'IMPRESSION (Invisible sur écran) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .text-print, .text-print * { visibility: visible; }
          .text-print { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          button { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default ConsultationRoom;