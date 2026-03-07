import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig';
import { 
  collection, onSnapshot, query, where, 
  doc, setDoc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  UserPlus, Search, Mail, Lock, User, 
  Trash2, ShieldCheck, Loader2, Edit3, X 
} from 'lucide-react';

const DoctorManager = () => {
  // États pour le formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [editId, setEditId] = useState(null); // Pour savoir si on modifie
  const [isProcessing, setIsProcessing] = useState(false);

  // États pour la liste
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. RÉCUPÉRATION (On récupère tout et on filtre en JS pour éviter les soucis de rôle)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "utilisateurs"), (snap) => {
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.rôle === "medecin" || u.rôle === "medicament" || u.role === "medecin"); 
      setDoctors(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. CRÉER OU METTRE À JOUR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editId) {
        // MODE UPDATE
        const docRef = doc(db, "utilisateurs", editId);
        await updateDoc(docRef, {
          nom,
          prenom,
          // On ne change généralement pas l'email/password ici pour la sécurité Auth
        });
        alert("Informations mises à jour !");
      } else {
        // MODE CRÉATION
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        await setDoc(doc(db, "utilisateurs", uid), {
          uid, nom, prenom, email,
          rôle: "medecin", // On force le bon rôle à la création
          mustChangePassword: true,
          createdAt: serverTimestamp()
        });
        alert("Médecin créé !");
      }
      resetForm();
    } catch (error) {
      alert("Erreur: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. SUPPRIMER
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce médecin définitivement ?")) {
      await deleteDoc(doc(db, "utilisateurs", id));
    }
  };

  // 4. PRÉPARER LA MODIFICATION
  const startEdit = (doctor) => {
    setEditId(doctor.id);
    setNom(doctor.nom || "");
    setPrenom(doctor.prenom || "");
    setEmail(doctor.email || "");
    // On cache le mot de passe car on ne peut pas le récupérer d'Auth
  };

  const resetForm = () => {
    setEditId(null);
    setEmail(""); setPassword(""); setNom(""); setPrenom("");
  };

  const filteredDoctors = doctors.filter(doc => {
    const s = searchTerm.toLowerCase();
    return (doc.nom || "").toLowerCase().includes(s) || (doc.email || "").toLowerCase().includes(s);
  });

  return (
    <div className="space-y-10 p-4">
      
      {/* FORMULAIRE DYNAMIQUE */}
      <div className={`p-8 rounded-[2.5rem] shadow-xl transition-all border-2 ${editId ? 'border-blue-500 bg-blue-50/30' : 'border-white bg-white'}`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${editId ? 'bg-blue-500 text-white' : 'bg-green-100 text-green-600'}`}>
              {editId ? <Edit3 size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{editId ? "Modifier le profil" : "Nouveau Médecin"}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                {editId ? `ID: ${editId}` : "Accès système"}
              </p>
            </div>
          </div>
          {editId && (
            <button onClick={resetForm} className="flex items-center gap-2 text-rose-500 font-bold text-sm bg-rose-50 px-4 py-2 rounded-xl">
              <X size={16} /> Annuler
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input required placeholder="Nom" value={nom} className="form-input-custom" onChange={(e) => setNom(e.target.value)} />
          <input required placeholder="Prénom" value={prenom} className="form-input-custom" onChange={(e) => setPrenom(e.target.value)} />
          
          <input 
            required disabled={!!editId} 
            type="email" placeholder="Email" value={email} 
            className={`form-input-custom ${editId ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          {!editId && (
            <input required type="password" placeholder="Mot de passe" value={password} className="form-input-custom" onChange={(e) => setPassword(e.target.value)} />
          )}

          <button 
            type="submit" disabled={isProcessing}
            className={`lg:col-span-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 text-white ${editId ? 'bg-blue-600' : 'bg-slate-900 hover:bg-green-600'}`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (editId ? "Mettre à jour les données" : "Inscrire le médecin")}
          </button>
        </form>
      </div>

      {/* TABLEAU DE GESTION */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
            <ShieldCheck className="text-green-500" /> Annuaire du Personnel
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Rechercher..."
              className="pl-12 pr-6 py-3 bg-white border-none rounded-2xl shadow-sm w-full md:w-80 focus:ring-2 focus:ring-green-500 font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Médecin</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Rôle en base</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 uppercase">
                        {doc.nom?.[0]}{doc.prenom?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 uppercase">{doc.nom} {doc.prenom}</p>
                        <p className="text-[10px] text-slate-400">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${doc.rôle === 'medecin' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {doc.rôle || doc.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(doc)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .form-input-custom {
          width: 100%;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border: none;
          border-radius: 1.25rem;
          font-weight: 700;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .form-input-custom:focus {
          box-shadow: 0 0 0 2px #22c55e;
          background: white;
        }
      `}</style>
    </div>
  );
};

export default DoctorManager;