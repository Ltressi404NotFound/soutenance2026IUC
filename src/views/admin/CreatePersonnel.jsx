import React, { useState } from 'react';
import { db, firebaseConfig } from '../../firebaseConfig'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app'; // Import pour l'instance secondaire
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const CreatePersonnel = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', role: 'medecin', specialite: 'Neurologue', matricule: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // --- ÉTAPE 1 : CRÉATION DU COMPTE SANS DÉCONNECTER L'ADMIN ---
      // On crée une application Firebase temporaire "Secondary"
      const secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        formData.email, 
        "123qwerty" // Le code prédéfini
      );
      
      const newUser = userCredential.user;

      // --- ÉTAPE 2 : ENREGISTREMENT DANS FIRESTORE ---
      await setDoc(doc(db, "utilisateurs", newUser.uid), {
        ...formData,
        uid: newUser.uid,
        mustChangePassword: true, // Le verrou de sécurité
        createdAt: serverTimestamp()
      });

      // --- ÉTAPE 3 : DÉCONNEXION DE L'INSTANCE SECONDAIRE ---
      await signOut(secondaryAuth);
      
      setSuccess(true);
      alert(`Succès ! Le compte est actif.\nIdentifiant : ${formData.email}\nMot de passe : 123qwerty`);
      
      // Reset du formulaire
      setFormData({ nom: '', prenom: '', email: '', role: 'medecin', specialite: 'Neurologue', matricule: '' });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      if(error.code === 'auth/email-already-in-use') {
        setErrorMsg("Cet email est déjà utilisé par un autre compte.");
      } else {
        setErrorMsg("Erreur: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-[#0056b3] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <UserPlus size={120} />
            </div>
          <h3 className="text-2xl font-black flex items-center gap-3 relative z-10">
            <UserPlus /> Enrôlement du Personnel
          </h3>
          <p className="opacity-80 text-sm mt-2 relative z-10 font-medium">
            Le personnel pourra se connecter avec le code par défaut : <span className="bg-white/20 px-2 py-0.5 rounded font-mono">123qwerty</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 animate-bounce">
              <AlertCircle size={20} /> <span className="font-bold text-sm">{errorMsg}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de famille</label>
              <input required type="text" value={formData.nom} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745]" 
                onChange={e => setFormData({...formData, nom: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
              <input required type="text" value={formData.prenom} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745]" 
                onChange={e => setFormData({...formData, prenom: e.target.value})} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Professionnel</label>
              <input required type="email" value={formData.email} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745]" 
                onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Matricule</label>
              <input required type="text" value={formData.matricule} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745]" 
                onChange={e => setFormData({...formData, matricule: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spécialisation</label>
            <select className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745] font-bold text-gray-700"
              value={formData.specialite}
              onChange={e => setFormData({...formData, specialite: e.target.value})}>
              <option value="Neurologue">Neurologue (Spécialiste Épilepsie)</option>
              <option value="Généraliste">Médecin Généraliste</option>
              <option value="Urgentiste">Urgentiste</option>
              <option value="Infirmier">Infirmier Major</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl ${
              success ? 'bg-green-500 scale-95' : 'bg-[#28a745] hover:bg-[#218838] hover:shadow-green-200'
            }`}
          >
            {loading ? (
                <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                </div>
            ) : success ? (
                <div className="flex items-center justify-center gap-3">
                    <CheckCircle size={20} /> Inscription Terminée
                </div>
            ) : "Valider l'enrôlement"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePersonnel;