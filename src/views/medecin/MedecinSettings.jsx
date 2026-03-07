import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../firebaseConfig';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const MedecinSettings = ({ onPasswordChanged }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: 'Vérification de la sécurité...', type: 'info' });
    
    const user = auth.currentUser;

    try {
      // 1. Re-authentification (Sécurité Firebase obligatoire pour changer un mot de passe)
      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);
      
      // 2. Mise à jour du mot de passe dans Firebase Auth
      await updatePassword(user, newPass);

      // 3. MISE À JOUR CRUCIALE : On lève le verrou dans Firestore
      const userRef = doc(db, "utilisateurs", user.uid);
      await updateDoc(userRef, {
        mustChangePassword: false
      });

      setStatus({ 
        loading: false, 
        msg: 'Mot de passe mis à jour ! Votre espace est maintenant déverrouillé.', 
        type: 'success' 
      });
      
      setOldPass(''); 
      setNewPass('');

      // 4. Rafraîchissement de l'interface
      // Si on a passé la fonction via les props, on l'appelle, sinon on recharge la page
      if (onPasswordChanged) {
        setTimeout(() => onPasswordChanged(), 2000);
      } else {
        setTimeout(() => window.location.reload(), 2000);
      }

    } catch (err) {
      console.error(err);
      let errorFriendly = "Ancien mot de passe incorrect.";
      if (newPass.length < 6) errorFriendly = "Le nouveau mot de passe doit faire au moins 6 caractères.";
      
      setStatus({ 
        loading: false, 
        msg: 'Erreur : ' + errorFriendly, 
        type: 'error' 
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 rounded-2xl ${status.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            <ShieldCheck size={32} />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black text-gray-800">Sécurité du Compte</h2>
            <p className="text-gray-400 text-sm italic">Personnalisez votre accès pour protéger les données patients.</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
            <input 
              type="password" 
              required 
              placeholder="Ex: 123qwerty"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
            <input 
              type="password" 
              required 
              placeholder="Minimum 6 caractères"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#28a745] transition-all"
            />
          </div>

          {status.msg && (
            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-pulse ${
              status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 
              status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 
              'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {status.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
              {status.msg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={status.loading || status.type === 'success'}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-all shadow-lg transform hover:scale-[1.02] active:scale-95 ${
              status.type === 'success' ? 'bg-green-500' : 'bg-[#28a745] hover:bg-green-700 shadow-green-100'
            }`}
          >
            {status.loading ? "Traitement en cours..." : status.type === 'success' ? "Succès !" : "Activer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MedecinSettings;